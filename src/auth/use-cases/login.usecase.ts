import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../../users/users.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
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

  async execute(body: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const isValidPassword = await this.passwordService.verify(body.password, user.password);

    if (!isValidPassword)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id.toString());

    return plainToInstance(AuthResponseDto, { accessToken, refreshToken });
  }
}
