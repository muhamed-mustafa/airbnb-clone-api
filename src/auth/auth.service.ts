import { Injectable } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { RefreshTokenInput } from './inputs/refresh-token.input';
import { RegisterInput } from './inputs/register.input';
import { LoginOutput } from './outputs/login.output';
import { RefreshTokenOutput } from './outputs/refresh-token.output';
import { RegisterOutput } from './outputs/register.output';
import { LoginUseCase } from './use-cases/login.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RegisterUseCase } from './use-cases/register.usecase';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async register(input: RegisterInput): Promise<RegisterOutput> {
    return await this.registerUseCase.execute(input);
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    return this.loginUseCase.execute(input);
  }

  async refreshToken(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    return this.refreshTokenUseCase.execute(input);
  }
}
