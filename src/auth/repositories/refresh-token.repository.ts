import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export interface RefreshTokenRepository {
  findByUserId(userId: string): Promise<RefreshTokenEntity | null>;
  save(userId: string, token: string): Promise<void>;
  rotate(userId: string, oldTokenHash: string, newTokenHash: string): Promise<boolean>;
}
