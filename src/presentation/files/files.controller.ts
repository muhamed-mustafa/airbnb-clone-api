import { StoredFile } from '@application/files/interfaces/file-storage.interface';
import { UploadFileUseCase } from '@application/files/use-cases/upload-file.usecase';
import { UploadFilesUseCase } from '@application/files/use-cases/upload-files.usecase';
import { Roles } from '@common/constants/roles.constant';
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { ApiUploadImageDocs } from '@presentation/swagger/decorators/files/api-upload-image-docs.decorator';
import { ApiUploadImagesDocs } from '@presentation/swagger/decorators/files/api-upload-images-docs.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import type {} from 'multer';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

@ApiTags(SWAGGER_TAGS.FILES)
@Controller('files')
export class FilesController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    private readonly uploadFilesUseCase: UploadFilesUseCase,
  ) {}

  @AllowedRoles(Roles.USER)
  @Post('images/batch')
  @ApiUploadImagesDocs()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: MAX_IMAGE_SIZE + 1 },
    }),
  )
  async uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE + 1 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ): Promise<StoredFile[]> {
    return this.uploadFilesUseCase.execute(
      files.map((file) => ({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      })),
      user.id,
    );
  }

  @AllowedRoles(Roles.USER)
  @Post('images')
  @ApiUploadImageDocs()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        // Multer rejects at the threshold; allow exactly MAX_IMAGE_SIZE bytes.
        fileSize: MAX_IMAGE_SIZE + 1,
        files: 1,
      },
    }),
  )
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            // Nest's validator uses size < maxSize, so the maximum stays inclusive.
            maxSize: MAX_IMAGE_SIZE + 1,
          }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<StoredFile> {
    return this.uploadFileUseCase.execute(
      {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      user.id,
    );
  }
}
