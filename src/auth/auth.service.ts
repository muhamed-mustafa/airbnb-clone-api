import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '../common/errors-handling/custom-exceptions/not-found.exception';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { I18nService } from 'nestjs-i18n';
import * as argon2d from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18nService: I18nService,
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
    return this.jwtService.signAsync({ id });
  }
}
