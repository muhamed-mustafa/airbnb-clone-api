import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

export interface TokenService {
  verify(token: string): Promise<{ payload: JwtPayload; type: string }>;
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
}
