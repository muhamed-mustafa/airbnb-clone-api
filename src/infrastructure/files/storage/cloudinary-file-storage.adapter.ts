import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { FileStorageError } from '@application/files/errors/file-storage.error';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

function toError(value: unknown, fallbackMessage: string): Error {
  if (value instanceof Error) {
    return value;
  }

  if (typeof value === 'string' && value.length > 0) {
    return new Error(value);
  }

  return new Error(fallbackMessage);
}

@Injectable()
export class CloudinaryFileStorageAdapter implements FileStorage {
  private readonly logger = new Logger(CloudinaryFileStorageAdapter.name);

  constructor(configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async upload(file: UploadFileInput): Promise<StoredFile> {
    try {
      const result = await this.uploadStream(file.buffer);

      return {
        key: result.public_id,
        url: result.secure_url,
      };
    } catch (error: unknown) {
      const normalizedError = toError(error, 'Cloudinary upload failed');

      this.logger.error(normalizedError.message, normalizedError.stack);

      throw new FileStorageError('FILE_UPLOAD_FAILED');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const response: unknown = await cloudinary.uploader.destroy(key, {
        resource_type: 'image',
      });

      if (
        typeof response !== 'object' ||
        response === null ||
        !('result' in response) ||
        typeof response.result !== 'string'
      ) {
        throw new Error('Invalid Cloudinary deletion response');
      }

      if (response.result !== 'ok' && response.result !== 'not found') {
        throw new Error('Cloudinary image deletion failed');
      }
    } catch (error: unknown) {
      const normalizedError = toError(error, 'Cloudinary delete failed');

      this.logger.error(normalizedError.message, normalizedError.stack);

      throw new FileStorageError('FILE_DELETE_FAILED');
    }
  }

  private uploadStream(buffer: Buffer): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'airbnb/units',
        },
        (error, result) => {
          if (error) {
            reject(toError(error, 'Cloudinary upload failed'));
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary returned an empty upload result'));
            return;
          }

          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        },
      );

      stream.end(buffer);
    });
  }
}
