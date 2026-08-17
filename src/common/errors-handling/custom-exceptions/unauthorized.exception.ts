import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class UnauthorizedException extends BaseCustomException {
  status = HttpStatus.UNAUTHORIZED;

  constructor(message: string) {
    super(message);
  }
}
