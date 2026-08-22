import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2d from 'argon2';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '../common/errors-handling/custom-exceptions/not-found.exception';
import { UnauthorizedException } from '../common/errors-handling/custom-exceptions/unauthorized.exception';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async register(body: RegisterDto) {
    const user = await this.userService.create(body);
    return this.generateToken(user.id);
  }

  async login(body: LoginDto) {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const isValidPassword = await argon2d.verify(user.password, body.password);

    if (!isValidPassword)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    return this.generateToken(user.id);
  }
  private async generateToken(id: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id, type: 'access' },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE_IN'),
        },
      ),
      this.jwtService.signAsync(
        { id, type: 'refresh' },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE_IN'),
        },
      ),
    ]);

    const hashedRefreshToken = await argon2d.hash(refreshToken);

    await this.refreshTokenModel.findOneAndUpdate(
      { userId: id },
      {
        userId: id,
        token: hashedRefreshToken,
      },
      { returnDocument: 'after', upsert: true },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(body: RefreshTokenDto) {
    type DecodedToken = { id: string; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync<DecodedToken>(body.token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));
    }

    if (decodedToken.type !== 'refresh')
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const refreshToken = await this.refreshTokenModel.findOne({ userId: decodedToken.id });

    if (!refreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const isValidRefreshToken = await argon2d.verify(refreshToken.token, body.token);

    if (!isValidRefreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    return this.generateToken(decodedToken.id);
  }
}
