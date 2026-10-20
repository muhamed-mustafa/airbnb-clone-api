import { StoredFile } from '@application/files/interfaces/file-storage.interface';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import { Roles } from '@common/constants/roles.constant';
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import type {} from 'multer';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@ApiTags(SWAGGER_TAGS.FILES)
@Controller('files')
export class FilesController {
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  @AllowedRoles(Roles.USER)
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: MAX_IMAGE_SIZE,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<StoredFile> {
    return this.uploadFileUseCase.execute({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  }
}
