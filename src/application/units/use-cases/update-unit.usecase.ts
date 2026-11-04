import type { UploadedFileRepository } from '@application/files/repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '@application/files/tokens/uploaded-file-repository.token';
import { UnitEntity } from '@application/units/entities/unit-entity';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { CheckUnitAuthUseCase } from '@application/units/use-cases/check-unit-auth.usecase';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import type { TransactionRunner } from '@common/transactions/transaction-runner';
import { TRANSACTION_RUNNER } from '@common/transactions/transaction-runner.token';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class UpdateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    private readonly findOneUnitUseCase: FindOneUnitUseCase,
    private readonly unitValidationUseCase: UnitValidationUseCase,
    private readonly unitAccessControlUseCase: CheckUnitAuthUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: UploadedFileRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(id: string, data: UpdateUnitInput, userId: string): Promise<UnitEntity> {
    const updated = await this.transactionRunner.run(async (session) => {
      const unit = await this.findOneUnitUseCase.execute({ id }, session);

      // 1. Authorization
      this.unitAccessControlUseCase.assertOwner(unit, userId);

      // 2. Optimistic concurrency check
      if (unit.version !== data.expectedVersion) {
        this.logger.warn('Unit version mismatch', {
          unitId: id,
          userId,
          expectedVersion: data.expectedVersion,
          currentVersion: unit.version,
        });

        throw new ApplicationError('UNIT_VERSION_CONFLICT');
      }

      await this.unitValidationUseCase.execute(data, unit.country, unit.city);

      const newPhotos = data.photos;

      const removedPhotos = newPhotos
        ? unit.photos.filter((photo) => !newPhotos.includes(photo))
        : [];

      const referencedPhotos = await this.unitRepository.findReferencedPhotos(
        removedPhotos,
        id,
        session,
      );

      const photosToDelete = removedPhotos.filter((photo) => !referencedPhotos.includes(photo));

      const reserved = await this.uploadedFileRepository.reservePhotosForDeletion(
        photosToDelete,
        session,
      );

      if (!reserved) {
        throw new ApplicationError('SOME_PHOTOS_NOT_AVAILABLE');
      }

      const addedPhotos = data.photos?.filter((photo) => !unit.photos.includes(photo)) ?? [];

      const bound = await this.uploadedFileRepository.bindPhotos(addedPhotos, session);

      if (!bound) {
        this.logger.warn('Some photos are not available for binding', {
          userId,
          photos: addedPhotos,
        });

        throw new ApplicationError('SOME_PHOTOS_NOT_AVAILABLE');
      }

      const updated = await this.unitRepository.update(id, data, session);

      if (!updated) {
        this.logger.warn('Unit no longer available for update', { unitId: id, userId });
        throw new ApplicationError('UNIT_NOT_FOUND');
      }

      return updated;
    });

    this.logger.info('Unit updated', { unitId: id, userId });

    return updated;
  }
}
