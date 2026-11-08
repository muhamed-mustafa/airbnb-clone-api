import type {
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UploadFileUseCase } from './upload-file.usecase';
import type { UploadedFileRepository } from '../repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '../tokens/uploaded-file-repository.token';

@Injectable()
export class UploadFilesUseCase {
  private readonly logger = new Logger(UploadFilesUseCase.name);

  constructor(
    private readonly uploadFile: UploadFileUseCase,
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly uploadedFiles: UploadedFileRepository,
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
          await this.uploadedFiles.markPhotosForDeletion([file.url]);
        } catch (error: unknown) {
          this.logger.error('Batch image upload cleanup could not be queued for retry', {
            errorName: error instanceof Error ? error.name : 'UnknownError',
          });
        }
      }

      throw uploadError;
    }
  }
}
