import { HttpStatus } from '@nestjs/common';

export const HTTP_ERROR_CODES: Partial<Record<number, string | undefined>> = {
  [HttpStatus.BAD_REQUEST]: 'errors.BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'errors.UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'errors.FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'errors.NOT_FOUND',
  [HttpStatus.CONFLICT]: 'errors.CONFLICT',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'errors.PAYLOAD_TOO_LARGE',
} as const;
