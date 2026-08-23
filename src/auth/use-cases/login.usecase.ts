import { Injectable } from '@nestjs/common';
import * as argon2id from 'argon2';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '../../common/errors-handling/custom-exceptions/not-found.exception';
import { UsersService } from '../../users/users.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
    private readonly i18nService: I18nService,
  ) {}

  async execute(body: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const isValidPassword = await argon2id.verify(user.password, body.password);

    if (!isValidPassword)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_CREDENTIALS'));

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id.toString());

    return plainToInstance(AuthResponseDto, { accessToken, refreshToken });
  }
}
