import { HttpStatus } from '@nestjs/common';
import type { ApplicationErrorCode } from '@common/errors/application.error';

export const applicationErrorStatusMap: Record<ApplicationErrorCode, number> = {
  INVALID_TOKEN: HttpStatus.UNAUTHORIZED,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  INVALID_PHONE_NUMBER: HttpStatus.BAD_REQUEST,
  COUNTRY_ALREADY_EXISTS: HttpStatus.CONFLICT,
  COUNTRY_NOT_FOUND: HttpStatus.NOT_FOUND,
};

export const applicationErrorMessageMap: Record<ApplicationErrorCode, string> = {
  INVALID_TOKEN: 'auth.INVALID_TOKEN',
  INVALID_CREDENTIALS: 'auth.INVALID_CREDENTIALS',
  INVALID_PHONE_NUMBER: 'auth.INVALID_PHONE_NUMBER',
  COUNTRY_ALREADY_EXISTS: 'countries.COUNTRY_ALREADY_EXISTS',
  COUNTRY_NOT_FOUND: 'countries.COUNTRY_NOT_FOUND',
};
