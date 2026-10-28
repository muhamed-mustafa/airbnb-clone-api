import type { FileStorageResolver } from '@application/files/interfaces/file-storage-resolver.interface';
import type { FileStorage } from '@application/files/interfaces/file-storage.interface';
import { ACTIVE_FILE_STORAGE_PROVIDER } from '@application/files/tokens/active-file-storage-provider.token';
import { FILE_STORAGE_RESOLVER } from '@application/files/tokens/file-storage-resolver.token';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';
import { UPLOADED_FILE_REPOSITORY } from '@application/files/tokens/uploaded-file-repository.token';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import { UploadFilesUseCase } from '@application/files/use-cases/upload-files.usecase';
import type { FileStorageProvider } from '@common/config/env.types';
import { MongooseUploadedFileRepository } from '@infrastructure/files/repositories/mongoose-uploaded-file.repository';
import {
  UploadedFile,
  UploadedFileSchema,
} from '@infrastructure/files/schemas/uploaded-file.schema';
import { LazyFileStorageResolver } from '@infrastructure/files/storage/file-storage-resolver';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from '@presentation/files/files.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UploadedFile.name, schema: UploadedFileSchema }])],
  providers: [
    {
      provide: FILE_STORAGE,
      inject: [ACTIVE_FILE_STORAGE_PROVIDER, FILE_STORAGE_RESOLVER],
      useFactory: (provider: FileStorageProvider, resolver: FileStorageResolver): FileStorage =>
        resolver.get(provider),
    },
    {
      provide: ACTIVE_FILE_STORAGE_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): FileStorageProvider =>
        config.getOrThrow<FileStorageProvider>('FILE_STORAGE_PROVIDER'),
    },
    { provide: FILE_STORAGE_RESOLVER, useClass: LazyFileStorageResolver },
    { provide: UPLOADED_FILE_REPOSITORY, useClass: MongooseUploadedFileRepository },
    UploadFileUseCase,
    UploadFilesUseCase,
  ],
  exports: [FILE_STORAGE, FILE_STORAGE_RESOLVER, UPLOADED_FILE_REPOSITORY],
  controllers: [FilesController],
})
export class FilesModule {}
