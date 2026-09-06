import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RefreshTokenRepository } from './refresh-token.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongooseRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async findByUserId(userId: string): Promise<RefreshTokenEntity | null> {
    const refreshToken = await this.refreshTokenModel.findOne({ userId });

    if (!refreshToken) return null;

    return {
      userId: refreshToken.userId,
      token: refreshToken.token,
    };
  }
}
