import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface RefreshTokenRepository {
  findByUserId(userId: string): Promise<RefreshTokenEntity | null>;
}
