import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UploadFileUseCase } from './upload-file.usecase';
import { ACTIVE_FILE_STORAGE_PROVIDER } from '../tokens/active-file-storage-provider.token';
import type { FileStorageProvider } from '@common/config/env.types';
import type { UploadedFileRepository } from '../repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '../tokens/uploaded-file-repository.token';

@Injectable()
export class UploadFilesUseCase {
  private readonly logger = new Logger(UploadFilesUseCase.name);

  constructor(
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
    private readonly uploadFile: UploadFileUseCase,
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly uploadedFiles: UploadedFileRepository,
    @Inject(ACTIVE_FILE_STORAGE_PROVIDER) private readonly provider: FileStorageProvider,
  ) {}

  async execute(files: UploadFileInput[], uploadedBy: string): Promise<StoredFile[]> {
    const uploadedFiles: StoredFile[] = [];

    try {
      for (const file of files) {
        const storedFile = await this.uploadFile.execute(file, uploadedBy);
        uploadedFiles.push(storedFile);
      }

      return uploadedFiles;
    } catch (uploadError: unknown) {
      // Best-effort rollback, not an atomic storage transaction.
      for (const file of uploadedFiles) {
        try {
          await this.fileStorage.delete(file.key);
          await this.uploadedFiles.remove(this.provider, file.key);
        } catch {
          // Never log provider errors, credentials, URLs or file contents here.
          this.logger.error('Batch image upload rollback: cleanup failed');
        }
      }

      throw uploadError;
    }
  }
}
