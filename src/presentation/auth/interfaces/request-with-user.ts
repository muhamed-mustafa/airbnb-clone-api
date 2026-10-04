import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Request } from 'express';

export type RequestWithUser = Request & {
  user: JwtPayload;
};
