import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { UsersService } from '@application/users/services/users.service';
import { LoginInput } from '../inputs/login.input';
import { LoginOutput } from '../outputs/login.output';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userService: UsersService,
    private readonly generateToken: GenerateTokenUseCase,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(body: LoginInput): Promise<LoginOutput> {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) {
      this.logger.warn('Login failed: unknown email');
      throw new ApplicationError('INVALID_CREDENTIALS');
    }

    const isValidPassword = await this.secretHashService.verify(user.password, body.password);

    if (!isValidPassword) {
      this.logger.warn('Login failed: invalid password', { userId: user.id });
      throw new ApplicationError('INVALID_CREDENTIALS');
    }

    this.logger.info('User logged in', { userId: user.id });

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id);

    return { accessToken, refreshToken };
  }
}
