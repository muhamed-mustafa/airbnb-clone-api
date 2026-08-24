import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class UnauthorizedException extends BaseCustomException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
