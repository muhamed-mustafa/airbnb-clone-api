import { Roles } from '@common/constants/roles.constant';
import { Test } from '@nestjs/testing';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import { UploadFilesUseCase } from '@application/files/use-cases/upload-files.usecase';
import { FilesController } from './files.controller';

describe('FilesController', () => {
  it('maps the multipart file to the upload input and returns the stored file', async () => {
    const result = { key: 'image-id', url: 'https://example.com/image.png' };
    const execute = jest.fn().mockResolvedValue(result);
    const module = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: UploadFileUseCase, useValue: { execute } },
        { provide: UploadFilesUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();
    const file = {
      buffer: Buffer.from('image'),
      originalname: 'image.png',
      mimetype: 'image/png',
      size: 5,
    } as Express.Multer.File;
    await expect(
      module.get(FilesController).uploadImage(file, { id: 'user-id', role: Roles.USER }),
    ).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      'user-id',
    );
    await module.close();
  });

  it('maps all multipart files in order and returns the batch result', async () => {
    const result = [
      { key: 'first', url: 'https://example.com/first.png' },
      { key: 'second', url: 'https://example.com/second.png' },
    ];
    const execute = jest.fn().mockResolvedValue(result);
    const module = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        { provide: UploadFileUseCase, useValue: { execute: jest.fn() } },
        { provide: UploadFilesUseCase, useValue: { execute } },
      ],
    }).compile();
    const files = ['first', 'second'].map(
      (name) =>
        ({
          buffer: Buffer.from(name),
          originalname: `${name}.png`,
          mimetype: 'image/png',
          size: name.length,
        }) as Express.Multer.File,
    );
    await expect(
      module.get(FilesController).uploadImages(files, { id: 'user-id', role: Roles.USER }),
    ).resolves.toBe(result);
    expect(execute).toHaveBeenCalledWith(
      files.map((file) => ({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })),
      'user-id',
    );
    await module.close();
  });
});
