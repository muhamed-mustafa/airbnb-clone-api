import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { RefreshTokenRepository } from './refresh-token.repository';

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

  async save(userId: string, token: string): Promise<void> {
    await this.refreshTokenModel.findOneAndUpdate(
      { userId },
      { userId, token },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async rotate(userId: string, oldTokenHash: string, newTokenHash: string): Promise<boolean> {
    const result = await this.refreshTokenModel.findOneAndUpdate(
      { userId, token: oldTokenHash },
      {
        $set: {
          token: newTokenHash,
        },
      },
      { returnDocument: 'after' },
    );

    return result !== null;
  }
}
