import { ROLES } from '../constants/roles.constant';

export interface JwtPayload {
  id: string;
  role: ROLES;
}
