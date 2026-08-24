import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class ForbiddenException extends BaseCustomException {
  constructor(message: string, status: HttpStatus = HttpStatus.FORBIDDEN) {
    super(message, status);
  }
}
