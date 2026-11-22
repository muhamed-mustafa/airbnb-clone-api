import { AuthService } from '@application/auth/services/auth.service';
import { LogoutUseCase } from '@application/auth/use-cases/logout.usecase';
import { ChangeMyPasswordUseCase } from '@application/auth/use-cases/change-my-password.usecase';
import { CustomerPasswordResetUseCase } from '@application/auth/use-cases/customer-password-reset.usecase';
import { CustomerActivationUseCase } from '@application/auth/use-cases/customer-activation.usecase';
import { ActivateCustomerDto } from './dtos/activate-customer.dto';
import { ResendCustomerActivationDto } from './dtos/resend-customer-activation.dto';
import { RegistrationPendingDto } from './dtos/registration-pending.dto';
import { RequestCustomerPasswordResetDto } from './dtos/request-customer-password-reset.dto';
import { VerifyCustomerPasswordResetDto } from './dtos/verify-customer-password-reset.dto';
import { CompleteCustomerPasswordResetDto } from './dtos/complete-customer-password-reset.dto';
import { ApiExtension, ApiOkResponse } from '@nestjs/swagger';
import { ChangeMyPasswordDto } from './dtos/change-my-password.dto';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
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
import { Roles } from '@common/enums/roles.enum';

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly changeMyPasswordUseCase: ChangeMyPasswordUseCase,
    private readonly passwordReset: CustomerPasswordResetUseCase,
    private readonly activation: CustomerActivationUseCase,
  ) {}

  @Post('register')
  @IsPublic()
  @ApiRegisterDocs()
  async register(
    @Body() body: RegisterDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<RegistrationPendingDto> {
    const input = AuthMapper.toRegisterInput(body);
    return this.authService.register({
      ...input,
      language: acceptLanguage?.startsWith('en') ? 'en' : 'ar',
    });
  }

  @Post('activation/resend')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiExtension('x-docs-audience', 'user')
  @ApiExtension('x-docs-order', 20)
  @ApiOperation({
    operationId: 'resendCustomerActivation',
    summary: 'Resend an email activation code',
  })
  @ApiOkResponse({ description: 'Generic response for pending and unknown accounts.' })
  async resendActivation(@Body() body: ResendCustomerActivationDto): Promise<{ message: string }> {
    await this.activation.issue(body.email, body.language);
    return {
      message:
        'If the account is awaiting activation and eligible for resend, a code will be sent.',
    };
  }

  @Post('activation/verify')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiExtension('x-docs-audience', 'user')
  @ApiExtension('x-docs-order', 30)
  @ApiOperation({
    operationId: 'verifyCustomerActivation',
    summary: 'Activate email and issue customer tokens',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  async verifyActivation(@Body() body: ActivateCustomerDto): Promise<AuthResponseDto> {
    return this.activation.verify(body.email, body.code);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiLoginDocs()
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toLoginInput(body);
    const output = await this.authService.login(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiRefreshTokenDocs()
  async refreshToken(@Body() body: RefreshTokenDto): Promise<AuthResponseDto> {
    const input = AuthMapper.toRefreshTokenInput(body);
    const output = await this.authService.refreshToken(input);
    return AuthMapper.toAuthResponse(output);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(Roles.USER)
  @ApiOperation({ operationId: 'logoutCustomer', summary: 'Revoke my refresh session' })
  @ApiNoContentResponse()
  async logout(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.logoutUseCase.execute(user.id);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'changeMyPassword',
    summary: 'Change my password and revoke refresh sessions',
  })
  @ApiNoContentResponse()
  async changeMyPassword(
    @CurrentUser() user: JwtPayload,
    @Body() body: ChangeMyPasswordDto,
  ): Promise<void> {
    await this.changeMyPasswordUseCase.execute(user.id, body.currentPassword, body.newPassword);
  }

  @Post('password-reset/request')
  @IsPublic()
  @ApiExtension('x-docs-audience', 'user')
  @ApiExtension('x-docs-order', 60)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'requestCustomerPasswordReset',
    summary: 'Email a one-time customer password reset code',
  })
  @ApiOkResponse({ description: 'Accepted for existing and unknown email addresses alike.' })
  async requestPasswordReset(
    @Body() body: RequestCustomerPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.passwordReset.request(body.email, body.language);
    return { message: 'If the account exists, a verification code has been sent.' };
  }

  @Post('password-reset/verify')
  @IsPublic()
  @ApiExtension('x-docs-audience', 'user')
  @ApiExtension('x-docs-order', 70)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'verifyCustomerPasswordReset',
    summary: 'Exchange an email code for a one-time reset token',
  })
  @ApiOkResponse({ description: 'Returns a short-lived, single-use reset token.' })
  async verifyPasswordReset(
    @Body() body: VerifyCustomerPasswordResetDto,
  ): Promise<{ resetToken: string }> {
    return this.passwordReset.verify(body.email, body.code);
  }

  @Post('password-reset/complete')
  @IsPublic()
  @ApiExtension('x-docs-audience', 'user')
  @ApiExtension('x-docs-order', 80)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'completeCustomerPasswordReset',
    summary: 'Reset customer password and revoke refresh sessions',
  })
  @ApiNoContentResponse()
  async completePasswordReset(@Body() body: CompleteCustomerPasswordResetDto): Promise<void> {
    await this.passwordReset.complete(body.resetToken, body.newPassword);
  }

  @Get('me')
  @AllowedRoles(Roles.ADMIN, Roles.USER)
  @ApiGetMeDocs()
  getMe(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }
}
