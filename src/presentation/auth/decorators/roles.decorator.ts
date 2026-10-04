import type { Roles } from '@common/constants/roles.constant';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
