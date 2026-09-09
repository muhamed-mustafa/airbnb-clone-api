import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../common/errors/application.error';
import { UsersService } from '../../users/users.service';
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
  ) {}

  async execute(body: LoginInput): Promise<LoginOutput> {
    const user = await this.userService.findOne({ email: body.email });

    if (!user) throw new ApplicationError('INVALID_CREDENTIALS');

    const isValidPassword = await this.secretHashService.verify(user.password, body.password);

    if (!isValidPassword) throw new ApplicationError('INVALID_CREDENTIALS');

    const { accessToken, refreshToken } = await this.generateToken.execute(user.id);

    return { accessToken, refreshToken };
  }
}
