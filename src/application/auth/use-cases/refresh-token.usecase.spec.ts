import { Roles } from '@common/constants/roles.constant';
import { ApplicationError } from '@common/errors/application.error';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { RefreshTokenUseCase } from './refresh-token.usecase';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const payload: JwtPayload = { id: 'user-1', role: Roles.USER };

  const refreshTokenRepository = {
    findByUserId: jest.fn(),
    save: jest.fn(),
    rotate: jest.fn(),
  };

  const tokenService = {
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const generateTokenExecute = jest.fn();
  const generateTokenRotate = jest.fn();

  const generateToken = {
    execute: generateTokenExecute,
    rotate: generateTokenRotate,
  } as unknown as ConstructorParameters<typeof RefreshTokenUseCase>[2];

  const secretHashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();

    useCase = new RefreshTokenUseCase(
      refreshTokenRepository,
      tokenService,
      generateToken,
      secretHashService,
      logger,
    );
  });

  describe('execute', () => {
    it('should refresh tokens successfully', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue(payload);

      refreshTokenRepository.findByUserId.mockResolvedValue({
        userId: 'user-1',
        token: 'old-token-hash',
      });

      secretHashService.verify.mockResolvedValue(true);

      generateTokenRotate.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await useCase.execute({
        token: 'old-refresh-token',
      });

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(generateTokenRotate).toHaveBeenCalledWith(payload, 'old-token-hash');
      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();
    });

    it('should throw INVALID_TOKEN when token type is not refresh', async () => {
      tokenService.verifyRefreshToken.mockRejectedValue(new ApplicationError('INVALID_TOKEN'));

      await expect(
        useCase.execute({
          token: 'access-token',
        }),
      ).rejects.toEqual(new ApplicationError('INVALID_TOKEN'));

      expect(refreshTokenRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw INVALID_TOKEN when stored refresh token is not found', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue(payload);

      refreshTokenRepository.findByUserId.mockResolvedValue(null);

      await expect(
        useCase.execute({
          token: 'refresh-token',
        }),
      ).rejects.toEqual(new ApplicationError('INVALID_TOKEN'));

      expect(secretHashService.verify).not.toHaveBeenCalled();
      expect(generateTokenRotate).not.toHaveBeenCalled();
    });

    it('should throw INVALID_TOKEN when refresh token hash verification fails', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue(payload);

      refreshTokenRepository.findByUserId.mockResolvedValue({
        userId: 'user-1',
        token: 'stored-token-hash',
      });

      secretHashService.verify.mockResolvedValue(false);

      await expect(
        useCase.execute({
          token: 'invalid-refresh-token',
        }),
      ).rejects.toEqual(new ApplicationError('INVALID_TOKEN'));

      expect(generateTokenRotate).not.toHaveBeenCalled();
    });
  });
});
