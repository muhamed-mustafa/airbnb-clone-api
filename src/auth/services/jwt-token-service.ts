import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { TokenService } from './token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18nService: I18nService,
  ) {}

  async verify(token: string): Promise<{ id: string; type: string }> {
    type DecodedToken = { id: string; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync<DecodedToken>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      return decodedToken;
    } catch {
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));
    }
  }
}
