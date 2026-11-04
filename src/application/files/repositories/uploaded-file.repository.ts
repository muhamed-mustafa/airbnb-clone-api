import type { StoredFile } from '@application/files/interfaces/file-storage.interface';
import type { UploadedFileStatus } from '@application/files/types/uploaded-file-status';
import type { FileStorageProvider } from '@common/config/env.types';
import type { TransactionSession } from '@common/transactions/transaction-runner';

export interface UploadedFileRecord extends StoredFile {
  provider: FileStorageProvider;
  uploadedBy: string;
  createdAt: Date;
  status: UploadedFileStatus;
}

export interface UploadedFileRepository {
  create(file: UploadedFileRecord): Promise<void>;
  remove(provider: FileStorageProvider, key: string): Promise<void>;
  bindPhotos(url: string[], session: TransactionSession): Promise<boolean>;
  reservePhotosForDeletion(urls: string[], session: TransactionSession): Promise<boolean>;
}
