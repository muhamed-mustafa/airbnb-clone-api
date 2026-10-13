import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation } from '@nestjs/swagger';
import { ApiFindAllUnitsDocs } from './api-find-all-units-docs.decorator';
export const ApiFindMyUnitsDocs = () =>
  applyDecorators(
    ApiFindAllUnitsDocs(),
    ApiExtension('x-docs-order', 25),
    ApiOperation({
      operationId: 'unitsFindMy',
      summary: 'List my accommodation listings',
      description:
        'Returns non-deleted units owned by the authenticated user, including inactive listings. Owner is taken from the access token. Supports the same filters and pagination as the public list; inactive units can be reactivated through the activate endpoint.',
    }),
  );
