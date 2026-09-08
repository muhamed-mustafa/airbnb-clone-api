import { HttpStatus } from '@nestjs/common';
import type { ApplicationErrorCode } from '../../errors/application.error';

export const applicationErrorStatusMap: Record<ApplicationErrorCode, number> = {
  INVALID_TOKEN: HttpStatus.UNAUTHORIZED,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  INVALID_PHONE_NUMBER: HttpStatus.BAD_REQUEST,
};

export const applicationErrorMessageMap: Record<ApplicationErrorCode, string> = {
  INVALID_TOKEN: 'auth.INVALID_TOKEN',
  INVALID_CREDENTIALS: 'auth.INVALID_CREDENTIALS',
  INVALID_PHONE_NUMBER: 'auth.INVALID_PHONE_NUMBER',
};
