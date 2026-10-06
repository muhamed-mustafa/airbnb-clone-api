import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Logger } from '@common/logging/logger';
import { Roles } from '../../../common/constants/roles.constant';
import { JwtTokenService } from './jwt-token-service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('JwtTokenService', () => {
  const config: Record<string, string | number> = {
    JWT_SECRET: 'test-access-secret',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret',
    ACCESS_TOKEN_EXPIRE_IN: 900,
    REFRESH_TOKEN_EXPIRE_IN: 86400,
  };
  const configService = {
    getOrThrow: (key: string) => config[key],
  } as unknown as ConfigService;
  const logger = { error: jest.fn(), warn: jest.fn(), info: jest.fn() } as unknown as Logger;
  const jwtService = new JwtService();
  const service = new JwtTokenService(jwtService, configService, logger);
  const payload = { id: '670d1234567890abcdef1234', role: Roles.ADMIN };

  const claims = (token: string) => jwtService.decode<Record<string, unknown>>(token);

  afterEach(() => jest.restoreAllMocks());

  describe('generateRefreshToken', () => {
    it('issues distinct tokens for the same account within the same second', async () => {
      // Freeze the clock: `iat` is identical, so only a unique id can tell the tokens apart.
      jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-07T10:00:00.250Z'));

      const first = await service.generateRefreshToken(payload);
      const second = await service.generateRefreshToken(payload);

      expect(claims(first).iat).toBe(claims(second).iat);
      // Compared as a boolean so a failure never prints a token.
      expect(first === second).toBe(false);
      expect(claims(first).jti).toMatch(UUID);
      expect(claims(second).jti).toMatch(UUID);
      expect(claims(first).jti).not.toBe(claims(second).jti);
    });

    it('still verifies as a refresh token and exposes only id and role', async () => {
      const token = await service.generateRefreshToken(payload);

      await expect(service.verifyRefreshToken(token)).resolves.toEqual(payload);
      await expect(service.verifyAccessToken(token)).rejects.toThrow();
    });
  });
});
