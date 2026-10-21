import { Test } from '@nestjs/testing';
import { FileStorageError } from '../errors/file-storage.error';
import { FILE_STORAGE } from '../tokens/file-storage.token';
import { UploadFileUseCase } from './upload-file.usecase';

describe('UploadFileUseCase', () => {
  const upload = jest.fn();
  let useCase: UploadFileUseCase;
  const input = {
    buffer: Buffer.from('image'),
    originalName: 'image.png',
    mimeType: 'image/png',
    size: 5,
  };

  beforeEach(async () => {
    upload.mockReset();
    const module = await Test.createTestingModule({
      providers: [UploadFileUseCase, { provide: FILE_STORAGE, useValue: { upload } }],
    }).compile();
    useCase = module.get(UploadFileUseCase);
  });

  it('delegates to FILE_STORAGE and returns its result', async () => {
    const result = { key: 'image-id', url: 'https://example.com/image.png' };
    upload.mockResolvedValue(result);
    await expect(useCase.execute(input)).resolves.toBe(result);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(input);
  });

  it('propagates storage failures', async () => {
    const error = new FileStorageError('FILE_UPLOAD_FAILED');
    upload.mockRejectedValue(error);
    await expect(useCase.execute(input)).rejects.toBe(error);
  });
});
