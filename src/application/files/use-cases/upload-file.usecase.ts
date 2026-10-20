import { Inject, Injectable } from '@nestjs/common';
import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(FILE_STORAGE)
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(file: UploadFileInput): Promise<StoredFile> {
    return this.fileStorage.upload(file);
  }
}
