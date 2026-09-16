import { LoginInput } from '@application/auth/inputs/login.input';
import { RefreshTokenInput } from '@application/auth/inputs/refresh-token.input';
import { RegisterInput } from '@application/auth/inputs/register.input';
import { LoginOutput } from '@application/auth/outputs/login.output';
import { RefreshTokenOutput } from '@application/auth/outputs/refresh-token.output';
import { RegisterOutput } from '@application/auth/outputs/register.output';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterDto } from '../dtos/register.dto';

type AuthOutput = RegisterOutput | LoginOutput | RefreshTokenOutput;

export class AuthMapper {
  static toRegisterInput(dto: RegisterDto): RegisterInput {
    return {
      name: dto.name,
      email: dto.email,
      countryCode: dto.countryCode,
      phone: dto.phone,
      password: dto.password,
    };
  }

  static toLoginInput(dto: LoginDto): LoginInput {
    return {
      email: dto.email,
      password: dto.password,
    };
  }

  static toRefreshTokenInput(dto: RefreshTokenDto): RefreshTokenInput {
    return {
      token: dto.token,
    };
  }

  static toAuthResponse(output: AuthOutput): AuthResponseDto {
    return {
      accessToken: output.accessToken,
      refreshToken: output.refreshToken,
    };
  }
}
