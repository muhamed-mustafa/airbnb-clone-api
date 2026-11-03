import type { UploadedFileRepository } from '@application/files/repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '@application/files/tokens/uploaded-file-repository.token';
import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import type { TransactionRunner } from '@common/transactions/transaction-runner';
import { TRANSACTION_RUNNER } from '@common/transactions/transaction-runner.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    private readonly unitValidationUseCase: UnitValidationUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: UploadedFileRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(data: CreateUnitInput, userId: string): Promise<UnitEntity> {
    await this.unitValidationUseCase.execute(data);

    const unit = await this.transactionRunner.run(async (session) => {
      const bound = await this.uploadedFileRepository.bindPhotos(data.photos, session);

      if (!bound) {
        this.logger.warn('Some photos are not available for binding', {
          userId,
          photos: data.photos,
        });
        throw new ApplicationError('SOME_PHOTOS_NOT_AVAILABLE');
      }

      return this.unitRepository.create({ ...data, user: userId }, session);
    });

    this.logger.info('Unit created', { unitId: unit.id, userId });
    return unit;
  }
}
