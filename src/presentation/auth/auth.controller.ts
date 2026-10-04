import { AuthService } from '@application/auth/services/auth.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiGetMeDocs } from '../swagger/decorators/auth/api-get-me-docs.decorator';
import { ApiLoginDocs } from '../swagger/decorators/auth/api-login-docs.decorator';
import { ApiRefreshTokenDocs } from '../swagger/decorators/auth/api-refresh-token-docs.decorator';
import { ApiRegisterDocs } from '../swagger/decorators/auth/api-register-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CurrentUser } from './decorators/current-user.decorator';
import { IsPublic } from './decorators/is-public.decorator';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { AuthMapper } from './mappers/auth.mapper';
import { AllowedRoles } from './decorators/roles.decorator';
import { Roles } from '../../common/constants/roles.constant';

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  @ApiRegisterDocs()
  async register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRegisterInput(body);
    const output = await this.authService.register(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('login')
  @IsPublic()
  @ApiLoginDocs()
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toLoginInput(body);
    const output = await this.authService.login(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('refresh-token')
  @IsPublic()
  @ApiRefreshTokenDocs()
  async refreshToken(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRefreshTokenInput(body);
    const output = await this.authService.refreshToken(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Get('me')
  @AllowedRoles(Roles.ADMIN, Roles.USER)
  @ApiGetMeDocs()
  getMe(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
