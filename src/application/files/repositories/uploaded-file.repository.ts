import type { StoredFile } from '@application/files/interfaces/file-storage.interface';
import type { FileStorageProvider } from '@common/config/env.types';

export interface UploadedFileRecord extends StoredFile {
  provider: FileStorageProvider;
  uploadedBy: string;
  createdAt: Date;
}

export interface UploadedFileRepository {
  create(file: UploadedFileRecord): Promise<void>;
  remove(provider: FileStorageProvider, key: string): Promise<void>;
}
