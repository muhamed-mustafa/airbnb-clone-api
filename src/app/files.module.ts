import type { FileStorage } from '@application/files/interfaces/file-storage.interface';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';
import type { FileStorageProvider } from '@common/config/env.types';
import { CloudinaryFileStorageAdapter } from '@infrastructure/files/storage/cloudinary-file-storage.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): FileStorage => {
        const provider = configService.getOrThrow<FileStorageProvider>('FILE_STORAGE_PROVIDER');

        switch (provider) {
          case 'cloudinary':
            return new CloudinaryFileStorageAdapter(configService);

          default:
            throw new Error(`Unsupported file storage provider: ${provider}`);
        }
      },
    },
  ],
  exports: [FILE_STORAGE],
})
export class FilesModule {}
