import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassThrough } from 'node:stream';
import { v2 as cloudinary } from 'cloudinary';
import { FileStorageError } from '@application/files/errors/file-storage.error';
import { CloudinaryFileStorageAdapter } from './cloudinary-file-storage.adapter';

jest.mock('cloudinary', () => ({
  v2: { config: jest.fn(), uploader: { upload_stream: jest.fn() } },
}));

describe('CloudinaryFileStorageAdapter upload errors', () => {
  afterEach(() => jest.restoreAllMocks());

  it('logs the provider failure internally and throws only FileStorageError', async () => {
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const failure = Object.assign(new Error('private-provider-diagnostic'), { http_code: 401 });
    jest.mocked(cloudinary.uploader.upload_stream).mockImplementation((...args: unknown[]) => {
      const callback = args[1] as (error: typeof failure) => void;
      callback(failure);
      return new PassThrough();
    });
    const adapter = new CloudinaryFileStorageAdapter(
      new ConfigService({
        CLOUDINARY_CLOUD_NAME: 'test-only',
        CLOUDINARY_API_KEY: 'test-only',
        CLOUDINARY_API_SECRET: 'test-only',
      }),
    );

    const upload = adapter.upload({
      buffer: Buffer.from('test-only'),
      originalName: 'image.png',
      mimeType: 'image/png',
      size: 9,
    });
    await expect(upload).rejects.toBeInstanceOf(FileStorageError);
    await expect(upload).rejects.toEqual(new FileStorageError('FILE_UPLOAD_FAILED'));
    expect(log).toHaveBeenCalledWith(failure.message, failure.stack);
  });
});
