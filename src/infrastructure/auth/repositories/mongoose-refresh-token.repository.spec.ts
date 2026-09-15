import { Model } from 'mongoose';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { MongooseRefreshTokenRepository } from './mongoose-refresh-token.repository';

describe('MongooseRefreshTokenRepository', () => {
  let repository: MongooseRefreshTokenRepository;
  let refreshTokenModel: {
    findOneAndUpdate: jest.Mock;
  };

  beforeEach(() => {
    refreshTokenModel = {
      findOneAndUpdate: jest.fn(),
    };

    repository = new MongooseRefreshTokenRepository(
      refreshTokenModel as unknown as Model<RefreshToken>,
    );
  });

  describe('rotate', () => {
    it('should rotate the refresh token when the old hash matches', async () => {
      refreshTokenModel.findOneAndUpdate.mockResolvedValue({
        userId: 'user-1',
        token: 'new-hash',
      });

      const result = await repository.rotate('user-1', 'old-hash', 'new-hash');

      expect(result).toBe(true);

      expect(refreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: 'user-1',
          token: 'old-hash',
        },
        {
          $set: {
            token: 'new-hash',
          },
        },
        {
          returnDocument: 'after',
        },
      );
    });

    it('should return false when the old hash no longer matches', async () => {
      refreshTokenModel.findOneAndUpdate.mockResolvedValue(null);

      const result = await repository.rotate('user-1', 'old-hash', 'new-hash');

      expect(result).toBe(false);

      expect(refreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          userId: 'user-1',
          token: 'old-hash',
        },
        {
          $set: {
            token: 'new-hash',
          },
        },
        {
          returnDocument: 'after',
        },
      );
    });
  });
});
