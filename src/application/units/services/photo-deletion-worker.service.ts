import type { FileStorageResolver } from '@application/files/interfaces/file-storage-resolver.interface';
import { FILE_STORAGE_RESOLVER } from '@application/files/tokens/file-storage-resolver.token';
import type { UploadedFileRepository } from '@application/files/repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '@application/files/tokens/uploaded-file-repository.token';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

const RETRY_INTERVAL_MS = 60_000;

@Injectable()
export class PhotoDeletionWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PhotoDeletionWorkerService.name);
  private retryTimer?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFiles: UploadedFileRepository,
    @Inject(UNIT_REPOSITORY) private readonly units: UnitRepository,
    @Inject(FILE_STORAGE_RESOLVER) private readonly storageResolver: FileStorageResolver,
  ) {}

  onModuleInit(): void {
    this.retryTimer = setInterval(() => {
      void this.retryPendingDeletions();
    }, RETRY_INTERVAL_MS);
    this.retryTimer.unref();
    void this.retryPendingDeletions();
  }

  onModuleDestroy(): void {
    if (this.retryTimer) clearInterval(this.retryTimer);
  }

  private async retryPendingDeletions(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingFiles = await this.uploadedFiles.findPendingDeletions();
      for (const file of pendingFiles) {
        try {
          const referencedPhotos = await this.units.findReferencedPhotos([file.url]);
          if (referencedPhotos.includes(file.url)) continue;

          await this.storageResolver.get(file.provider).delete(file.key);
          await this.uploadedFiles.markDeleted(file.provider, file.key);
        } catch (error: unknown) {
          this.logger.error('Pending image deletion failed; it will be retried', {
            provider: file.provider,
            errorName: error instanceof Error ? error.name : 'UnknownError',
          });
        }
      }
    } catch (error: unknown) {
      this.logger.error('Pending image deletion scan failed; it will be retried', {
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
    } finally {
      this.isProcessing = false;
    }
  }
}
