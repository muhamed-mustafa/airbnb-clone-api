import { Test } from '@nestjs/testing';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import { FilesController } from './files.controller';

describe('FilesController', () => {
  it('maps the multipart file to the upload input and returns the stored file', async () => {
    const result = { key: 'image-id', url: 'https://example.com/image.png' };
    const execute = jest.fn().mockResolvedValue(result);
    const module = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [{ provide: UploadFileUseCase, useValue: { execute } }],
    }).compile();
    const file = {
      buffer: Buffer.from('image'),
      originalname: 'image.png',
      mimetype: 'image/png',
      size: 5,
    } as Express.Multer.File;
    await expect(module.get(FilesController).uploadImage(file)).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    await module.close();
  });
});
