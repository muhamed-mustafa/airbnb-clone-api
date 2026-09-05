import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RegisterDto } from '../dtos/register.dto';
import { LoginInput } from '../inputs/login.input';
import { RefreshTokenInput } from '../inputs/refresh-token.input';
import { RegisterInput } from '../inputs/register.input';
import { LoginOutput } from '../outputs/login.output';
import { RefreshTokenOutput } from '../outputs/refresh-token.output';
import { RegisterOutput } from '../outputs/register.output';

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
