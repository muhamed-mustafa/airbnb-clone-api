import { LoginInput } from '../inputs/login.input';
import { RefreshTokenInput } from '../inputs/refresh-token.input';
import { RegisterInput } from '../inputs/register.input';
import { LoginOutput } from '../outputs/login.output';
import { RefreshTokenOutput } from '../outputs/refresh-token.output';
import { RegisterOutput } from '../outputs/register.output';
import { AuthResponseDto } from '../presentation/dtos/auth-response.dto';
import { LoginDto } from '../presentation/dtos/login.dto';
import { RefreshTokenDto } from '../presentation/dtos/refresh-token.dto';
import { RegisterDto } from '../presentation/dtos/register.dto';

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
