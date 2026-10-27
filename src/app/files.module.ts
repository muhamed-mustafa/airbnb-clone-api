import type { FileStorage } from '@application/files/interfaces/file-storage.interface';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import type { FileStorageProvider } from '@common/config/env.types';
import { CloudinaryFileStorageAdapter } from '@infrastructure/files/storage/cloudinary-file-storage.adapter';
import { S3FileStorageAdapter } from '@infrastructure/files/storage/s3-file-storage.adapter';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesController } from '@presentation/files/files.controller';

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
          case 's3':
            return new S3FileStorageAdapter(configService);

          default:
            throw new Error(`Unsupported file storage provider: ${String(provider)}`);
        }
      },
    },
    UploadFileUseCase,
  ],
  exports: [FILE_STORAGE],
  controllers: [FilesController],
})
export class FilesModule {}
