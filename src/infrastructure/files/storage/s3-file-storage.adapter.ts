import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type {
  FileStorage,
  StoredFile,
  UploadFileInput,
} from '@application/files/interfaces/file-storage.interface';
import { FileStorageError } from '@application/files/errors/file-storage.error';

const IMAGE_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class S3FileStorageAdapter implements FileStorage {
  private readonly logger = new Logger(S3FileStorageAdapter.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;
  private readonly keyPrefix: string;

  constructor(configService: ConfigService) {
    // Leave credentials to the SDK's default chain (environment, profile or IAM role).
    this.client = new S3Client({ region: configService.getOrThrow<string>('AWS_REGION') });
    this.bucket = configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.baseUrl = configService.getOrThrow<string>('AWS_S3_BASE_URL').replace(/\/+$/, '');
    this.keyPrefix = configService.get<string>('AWS_S3_KEY_PREFIX', 'airbnb/units');
  }

  async upload(file: UploadFileInput): Promise<StoredFile> {
    try {
      const extension = IMAGE_EXTENSIONS[file.mimeType];
      if (!extension) throw new Error('Unsupported image type');
      const key = `${this.keyPrefix}/${randomUUID()}.${extension}`;
      const url = `${this.baseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
        }),
      );
      return { key, url };
    } catch (error: unknown) {
      this.logError('S3 upload failed', error);
      throw new FileStorageError('FILE_UPLOAD_FAILED');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // S3 DeleteObject also succeeds when the key does not exist.
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error: unknown) {
      this.logError('S3 delete failed', error);
      throw new FileStorageError('FILE_DELETE_FAILED');
    }
  }
  private logError(message: string, error: unknown): void {
    // Only allow diagnostic fields; never log the full SDK error or request.
    const metadata = error instanceof S3ServiceException ? error.$metadata : undefined;
    this.logger.error({
      message,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      httpStatusCode: metadata?.httpStatusCode,
      requestId: metadata?.requestId,
    });
  }
}
