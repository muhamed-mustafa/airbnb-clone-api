import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiConflictErrorResponse } from '../common/presentation/swagger/decorators/api-conflict-error-response.decorator';
import {
  ApiInvalidCredentialsResponse,
  ApiInvalidTokenResponse,
} from '../common/presentation/swagger/decorators/api-application-error-responses.decorator';
import { ApiRegisterBadRequestResponses } from '../common/presentation/swagger/decorators/api-register-error-responses.decorator';
import { ApiInternalErrorResponse } from '../common/presentation/swagger/decorators/api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../common/presentation/swagger/decorators/api-validation-error-response.decorator';
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
  @ApiOperation({
    operationId: 'authRegister',
    summary: 'Register a new account',
    description:
      'Creates a new user account with the provided profile details and returns JWT access and refresh tokens.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Account created successfully. Returns access and refresh tokens.',
    type: AuthResponseDto,
  })
  @ApiRegisterBadRequestResponses()
  @ApiConflictErrorResponse()
  @ApiInternalErrorResponse()
  async register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRegisterInput(body);
    const output = await this.authService.register(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('login')
  @ApiOperation({
    operationId: 'authLogin',
    summary: 'Authenticate with email and password',
    description:
      'Validates user credentials and returns JWT access and refresh tokens for authenticated API access.',
  })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({
    description: 'Authentication successful. Returns access and refresh tokens.',
    type: AuthResponseDto,
  })
  @ApiValidationErrorResponse()
  @ApiInvalidCredentialsResponse()
  @ApiInternalErrorResponse()
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toLoginInput(body);
    const output = await this.authService.login(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('refresh-token')
  @ApiOperation({
    operationId: 'authRefreshToken',
    summary: 'Refresh access token',
    description:
      'Exchanges a valid refresh token for a new access token and refresh token pair. The previous refresh token is invalidated.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiCreatedResponse({
    description: 'Tokens refreshed successfully. Returns a new access and refresh token pair.',
    type: AuthResponseDto,
  })
  @ApiValidationErrorResponse()
  @ApiInvalidTokenResponse()
  @ApiInternalErrorResponse()
  async refreshToken(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRefreshTokenInput(body);
    const output = await this.authService.refreshToken(input);
    return AuthMapper.toAuthResponse(output);
  }
}
