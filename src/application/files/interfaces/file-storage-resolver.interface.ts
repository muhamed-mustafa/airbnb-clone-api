import type { FileStorageProvider } from '@common/config/env.types';
import type { FileStorage } from './file-storage.interface';

export interface FileStorageResolver {
  get(provider: FileStorageProvider): FileStorage;
}
