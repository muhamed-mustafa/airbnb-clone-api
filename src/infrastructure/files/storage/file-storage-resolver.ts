import type { FileStorage } from '@application/files/interfaces/file-storage.interface';
import type { FileStorageResolver } from '@application/files/interfaces/file-storage-resolver.interface';
import type { FileStorageProvider } from '@common/config/env.types';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryFileStorageAdapter } from './cloudinary-file-storage.adapter';
import { S3FileStorageAdapter } from './s3-file-storage.adapter';

@Injectable()
export class LazyFileStorageResolver implements FileStorageResolver {
  private readonly adapters = new Map<FileStorageProvider, FileStorage>();

  constructor(private readonly configService: ConfigService) {}

  get(provider: FileStorageProvider): FileStorage {
    const cached = this.adapters.get(provider);
    if (cached) return cached;

    let adapter: FileStorage;
    switch (provider) {
      case 'cloudinary':
        adapter = new CloudinaryFileStorageAdapter(this.configService);
        break;
      case 's3':
        adapter = new S3FileStorageAdapter(this.configService);
        break;
      default:
        throw new Error(`Unsupported file storage provider: ${String(provider)}`);
    }

    this.adapters.set(provider, adapter);
    return adapter;
  }
}
