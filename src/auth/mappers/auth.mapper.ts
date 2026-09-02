import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RegisterInput } from '../inputs/register.input';
import { RegisterOutput } from '../outputs/register.output';

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

  static toAuthResponse(output: RegisterOutput): AuthResponseDto {
    return {
      accessToken: output.accessToken,
      refreshToken: output.refreshToken,
    };
  }
}
