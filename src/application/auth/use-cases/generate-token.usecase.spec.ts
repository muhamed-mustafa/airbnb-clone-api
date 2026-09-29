import { ROLES } from '@common/constants/roles.constant';
import { ApplicationError } from '@common/errors/application.error';
import { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { GenerateTokenUseCase } from './generate-token.usecase';

describe('GenerateTokenUseCase', () => {
  let useCase: GenerateTokenUseCase;

  const payload: JwtPayload = { id: 'user-1', role: ROLES.USER };

  const refreshTokenRepository = {
    findByUserId: jest.fn(),
    save: jest.fn(),
    rotate: jest.fn(),
  };

  const tokenService = {
    verify: jest.fn(),
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const secretHashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  };

  const logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new GenerateTokenUseCase(
      refreshTokenRepository,
      tokenService,
      secretHashService,
      logger,
    );
  });

  describe('rotate', () => {
    it('should generate and rotate tokens successfully', async () => {
      tokenService.generateAccessToken.mockResolvedValue('new-access-token');
      tokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      secretHashService.hash.mockResolvedValue('new-refresh-token-hash');

      refreshTokenRepository.rotate.mockResolvedValue(true);

      const result = await useCase.rotate(payload, 'old-refresh-token-hash');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(refreshTokenRepository.rotate).toHaveBeenCalledWith(
        'user-1',
        'old-refresh-token-hash',
        'new-refresh-token-hash',
      );
    });

    it('should throw INVALID_TOKEN when rotation fails', async () => {
      tokenService.generateAccessToken.mockResolvedValue('new-access-token');
      tokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      secretHashService.hash.mockResolvedValue('new-refresh-token-hash');

      refreshTokenRepository.rotate.mockResolvedValue(false);

      await expect(useCase.rotate(payload, 'old-refresh-token-hash')).rejects.toEqual(
        new ApplicationError('INVALID_TOKEN'),
      );
    });
  });
});
