import { Roles } from '../constants/roles.constant';

export interface JwtPayload {
  id: string;
  role: Roles;
}
