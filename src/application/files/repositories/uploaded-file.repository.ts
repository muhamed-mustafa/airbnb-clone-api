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

export type UploadedFileDeletion = Pick<UploadedFileRecord, 'provider' | 'key' | 'url'>;

export interface UploadedFileRepository {
  create(file: UploadedFileRecord): Promise<void>;
  scheduleDeletion(file: UploadedFileRecord): Promise<void>;
  markPhotosForDeletion(urls: string[]): Promise<void>;
  bindPhotos(url: string[], session: TransactionSession): Promise<boolean>;
  reservePhotosForDeletion(urls: string[], session: TransactionSession): Promise<boolean>;
  findPendingDeletions(): Promise<UploadedFileDeletion[]>;
  markDeleted(provider: FileStorageProvider, key: string): Promise<void>;
}
