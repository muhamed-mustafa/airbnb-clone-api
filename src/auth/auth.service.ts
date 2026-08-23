import { Injectable } from '@nestjs/common';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
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

  async register(body: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(body);
  }

  async login(body: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(body);
  }

  async refreshToken(body: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(body);
  }
}
