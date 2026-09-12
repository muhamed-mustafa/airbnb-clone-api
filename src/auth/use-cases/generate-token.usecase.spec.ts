import { ApplicationError } from '../../common/errors/application.error';
import { GenerateTokenUseCase } from './generate-token.usecase';

describe('GenerateTokenUseCase', () => {
  let useCase: GenerateTokenUseCase;

  const refreshTokenRepository = {
    save: jest.fn(),
    rotate: jest.fn(),
  };

  const tokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const secretHashService = {
    hash: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new GenerateTokenUseCase(refreshTokenRepository, tokenService, secretHashService);
  });

  describe('rotate', () => {
    it('should generate and rotate tokens successfully', async () => {
      tokenService.generateAccessToken.mockResolvedValue('new-access-token');
      tokenService.generateRefreshToken.mockResolvedValue('new-refresh-token');

      secretHashService.hash.mockResolvedValue('new-refresh-token-hash');

      refreshTokenRepository.rotate.mockResolvedValue(true);

      const result = await useCase.rotate('user-1', 'old-refresh-token-hash');

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

      await expect(useCase.rotate('user-1', 'old-refresh-token-hash')).rejects.toEqual(
        new ApplicationError('INVALID_TOKEN'),
      );
    });
  });
});
