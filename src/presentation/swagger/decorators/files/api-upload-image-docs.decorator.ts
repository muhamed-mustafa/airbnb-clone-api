import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HttpErrorsResponseDto } from '../../dtos/http-errors-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

export const ApiUploadImageDocs = () =>
  applyDecorators(
    ApiOperation({
      operationId: 'filesUploadImage',
      summary: 'Upload an image',
      description:
        'Requires an authenticated user with the USER role. Upload one JPEG, PNG or WebP image under the file field. The maximum size is 5 MB (5,242,880 bytes), inclusive. File contents are checked. Use the returned URL in the photos field when creating or updating a unit through the units API.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description:
              'JPEG (image/jpeg), PNG (image/png), or WebP (image/webp), up to 5 MB inclusive.',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Image stored successfully. The response is wrapped in data by the API.',
      schema: {
        type: 'object',
        required: ['key', 'url'],
        properties: {
          key: { type: 'string', example: 'airbnb/units/image-id' },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://res.cloudinary.com/demo/image/upload/image-id.jpg',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        'The file is missing, has unsupported or invalid image contents, or the multipart field/count is invalid.',
      type: HttpErrorsResponseDto,
      examples: {
        missingFile: {
          summary: 'Missing file',
          value: { errors: [{ code: 'errors.BAD_REQUEST', message: 'Bad request' }] },
        },
        invalidImage: {
          summary: 'Unsupported type or invalid image contents',
          value: { errors: [{ code: 'errors.BAD_REQUEST', message: 'Bad request' }] },
        },
        invalidMultipart: {
          summary: 'Unexpected file field or multiple files',
          value: { errors: [{ code: 'errors.BAD_REQUEST', message: 'Bad request' }] },
        },
      },
    }),
    ApiResponse({
      status: 413,
      description:
        'The multipart file exceeds 5 MB (5,242,880 bytes). The current HTTP exception filter uses its generic error code for status 413.',
      type: HttpErrorsResponseDto,
      example: {
        errors: [{ code: 'errors.INTERNAL_SERVER_ERROR', message: 'Internal server error' }],
      },
    }),
    ApiInternalErrorResponse(),
  );
