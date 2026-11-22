import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBody,
  ApiExtraModels,
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { InternalErrorResponseDto } from '../swagger/dtos/internal-error-response.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiValidationErrorResponse } from '../swagger/decorators/api-validation-error-response.decorator';
import { AdminService } from '@application/admin/services/admin.service';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { AuthResponseDto } from '../auth/dtos/auth-response.dto';
import { ApiAdminLoginDocs } from '../swagger/decorators/admins/api-admin-login-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { AdminMapper } from './mappers/admin.mapper';
import { CompleteAdminPasswordResetDto } from './dtos/complete-admin-password-reset.dto';
import { RequestAdminPasswordResetDto } from './dtos/request-admin-password-reset.dto';
import { VerifyAdminPasswordResetDto } from './dtos/verify-admin-password-reset.dto';

class AdminPasswordResetRequestedResponseDto {
  @ApiProperty({ example: 'If the account exists, a verification code has been sent.' })
  message!: string;
}

class AdminPasswordResetVerifiedResponseDto {
  @ApiProperty({ description: 'Single-use reset token; expires after 10 minutes.' })
  resetToken!: string;
}

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth/admin')
export class AdminAuthController {
  constructor(
    private readonly adminService: AdminService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiAdminLoginDocs()
  async login(@Body() body: LoginAdminDto): Promise<AuthResponseDto> {
    const output = await this.adminService.login(AdminMapper.toLoginInput(body));
    return AdminMapper.toAuthResponse(output);
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  @IsPublic()
  @ApiExtension('x-docs-audience', 'admin')
  @ApiExtension('x-docs-order', 11)
  @ApiOperation({
    operationId: 'requestAdminPasswordReset',
    summary: 'Request admin password reset code',
    description:
      'Sends a one-time code to the admin email when an eligible account exists. The response does not disclose whether the account exists.',
  })
  @ApiBody({ type: RequestAdminPasswordResetDto })
  @ApiAcceptedResponse({ type: AdminPasswordResetRequestedResponseDto })
  @ApiExtraModels(InternalErrorResponseDto)
  @ApiResponse({
    status: 503,
    description: 'Password reset email delivery is not configured.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(InternalErrorResponseDto) },
        examples: {
          unavailable: {
            value: {
              errors: [
                {
                  code: 'ADMIN_PASSWORD_RESET_EMAIL_UNAVAILABLE',
                  message: 'Admin password reset email delivery is not configured.',
                },
              ],
            },
          },
        },
      },
    },
  })
  async requestPasswordReset(@Body() body: RequestAdminPasswordResetDto) {
    const language = I18nContext.current()?.lang.split('-')[0] === 'ar' ? 'ar' : 'en';
    await this.adminService.requestPasswordReset(body.email, language);
    return {
      message: this.i18nService.translate('admins.ADMIN_PASSWORD_RESET_REQUEST_ACCEPTED'),
    };
  }

  @Post('password-reset/verify')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiExtension('x-docs-audience', 'admin')
  @ApiExtension('x-docs-order', 12)
  @ApiOperation({
    operationId: 'verifyAdminPasswordResetCode',
    summary: 'Verify admin password reset code',
    description:
      'Consumes a valid one-time code and returns a short-lived, single-use reset token.',
  })
  @ApiBody({ type: VerifyAdminPasswordResetDto })
  @ApiOkResponse({ type: AdminPasswordResetVerifiedResponseDto })
  @ApiValidationErrorResponse({
    invalidCode: {
      summary: 'Invalid or expired verification code',
      value: {
        errors: [
          {
            code: 'ADMIN_PASSWORD_RESET_CODE_INVALID',
            message: 'The verification code is invalid or expired.',
          },
        ],
      },
    },
  })
  verifyPasswordReset(@Body() body: VerifyAdminPasswordResetDto) {
    return this.adminService.verifyPasswordReset(body.email, body.code);
  }

  @Post('password-reset/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @IsPublic()
  @ApiExtension('x-docs-audience', 'admin')
  @ApiExtension('x-docs-order', 13)
  @ApiOperation({
    operationId: 'completeAdminPasswordReset',
    summary: 'Set a new admin password',
    description:
      'Consumes the reset token and updates the admin password. This does not sign in automatically.',
  })
  @ApiBody({ type: CompleteAdminPasswordResetDto })
  @ApiValidationErrorResponse({
    invalidToken: {
      summary: 'Invalid, expired, or already used reset token',
      value: {
        errors: [
          {
            code: 'ADMIN_PASSWORD_RESET_SESSION_INVALID',
            message: 'The reset session is invalid or expired. Start again.',
          },
        ],
      },
    },
  })
  async completePasswordReset(@Body() body: CompleteAdminPasswordResetDto): Promise<void> {
    await this.adminService.completePasswordReset(body.resetToken, body.newPassword);
  }
}
