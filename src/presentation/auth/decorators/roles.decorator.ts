import type { Roles } from '@common/constants/roles.constant';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtension,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SWAGGER_BEARER_AUTH } from '../../swagger/swagger.constants';

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Roles[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiExtension('x-docs-roles', roles),
    ApiBearerAuth(SWAGGER_BEARER_AUTH),
    ApiUnauthorizedResponse({ description: 'Access token is missing, invalid, or expired.' }),
    ApiForbiddenResponse({ description: 'The authenticated role cannot access this operation.' }),
  );
