import { Inject, Injectable, Logger } from '@nestjs/common';
import { ACTIVE_FILE_STORAGE_PROVIDER } from '../tokens/active-file-storage-provider.token';
import type { FileStorageProvider } from '@common/config/env.types';
import type { UploadedFileRepository } from '../repositories/uploaded-file.repository';
import { UPLOADED_FILE_REPOSITORY } from '../tokens/uploaded-file-repository.token';
import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';

@Injectable()
export class UploadFileUseCase {
  private readonly logger = new Logger(UploadFileUseCase.name);
  constructor(
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
    @Inject(UPLOADED_FILE_REPOSITORY) private readonly uploadedFiles: UploadedFileRepository,
    @Inject(ACTIVE_FILE_STORAGE_PROVIDER) private readonly provider: FileStorageProvider,
  ) {}

  async execute(file: UploadFileInput, uploadedBy: string): Promise<StoredFile> {
    const storedFile = await this.fileStorage.upload(file);
    try {
      await this.uploadedFiles.create({
        ...storedFile,
        provider: this.provider,
        uploadedBy,
        createdAt: new Date(),
      });
    } catch (metadataError: unknown) {
      try {
        await this.fileStorage.delete(storedFile.key);
      } catch {
        this.logger.error('Upload metadata persistence rollback: file deletion failed');
      }
      throw metadataError;
    }
    return storedFile;
  }
}
