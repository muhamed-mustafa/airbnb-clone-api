import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { LoginInput } from '../inputs/login.input';
import { LoginOutput } from '../outputs/login.output';
import { PasswordService } from '../services/password.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
    private readonly i18nService: I18nService,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(body: LoginInput): Promise<LoginOutput> {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const isValidPassword = await this.passwordService.verify(body.password, user.password);

    if (!isValidPassword)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id);

    return { accessToken, refreshToken };
  }
}
