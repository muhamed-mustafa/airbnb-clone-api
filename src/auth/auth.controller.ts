import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRegisterDocs } from '../common/presentation/swagger/decorators/auth/api-register-docs.decorator';
import { ApiLoginDocs } from '../common/presentation/swagger/decorators/auth/api-login-docs.decorator';
import { ApiRefreshTokenDocs } from '../common/presentation/swagger/decorators/auth/api-refresh-token-docs.decorator';
import { SWAGGER_TAGS } from '../common/presentation/swagger/swagger.constants';
import { AuthService } from './auth.service';
import { AuthMapper } from './mappers/auth.mapper';
import { AuthResponseDto } from './presentation/dtos/auth-response.dto';
import { LoginDto } from './presentation/dtos/login.dto';
import { RefreshTokenDto } from './presentation/dtos/refresh-token.dto';
import { RegisterDto } from './presentation/dtos/register.dto';

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiRegisterDocs()
  async register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRegisterInput(body);
    const output = await this.authService.register(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('login')
  @ApiLoginDocs()
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toLoginInput(body);
    const output = await this.authService.login(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('refresh-token')
  @ApiRefreshTokenDocs()
  async refreshToken(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRefreshTokenInput(body);
    const output = await this.authService.refreshToken(input);
    return AuthMapper.toAuthResponse(output);
  }
}
