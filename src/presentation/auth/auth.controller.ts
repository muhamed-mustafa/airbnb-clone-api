import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiRegisterDocs } from '../swagger/decorators/auth/api-register-docs.decorator';
import { ApiLoginDocs } from '../swagger/decorators/auth/api-login-docs.decorator';
import { ApiRefreshTokenDocs } from '../swagger/decorators/auth/api-refresh-token-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { AuthService } from '../../application/auth/services/auth.service';
import { AuthMapper } from './mappers/auth.mapper';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';

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
