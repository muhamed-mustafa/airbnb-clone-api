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

export const ApiUploadImagesDocs = () =>
  applyDecorators(
    ApiOperation({
      operationId: 'filesUploadImages',
      summary: 'Upload a batch of images',
      description:
        'Requires an authenticated user with the USER role. Upload 1–5 JPEG, PNG or WebP images under the files field, up to 5 MiB (5,242,880 bytes) each, inclusive. All file contents are validated before uploading. Results preserve input order. On upload failure, previously uploaded files are deleted on a best-effort basis; rollback is not atomic and cleanup may fail. Use the returned URLs in a unit’s photos field.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            minItems: 1,
            maxItems: 5,
            items: { type: 'string', format: 'binary' },
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'Images stored in input order, wrapped in data.',
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            minItems: 1,
            maxItems: 5,
            items: {
              type: 'object',
              required: ['key', 'url'],
              properties: {
                key: { type: 'string', example: 'airbnb/units/image-id' },
                url: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://images.example.com/airbnb/units/image-id.jpg',
                },
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description:
        'No files, more than five files, unexpected multipart field, or invalid image contents.',
      type: HttpErrorsResponseDto,
    }),
    ApiResponse({
      status: 413,
      description: 'An image exceeds 5 MiB (5,242,880 bytes).',
      type: HttpErrorsResponseDto,
    }),
    ApiInternalErrorResponse(),
  );
