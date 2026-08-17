import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class ForbiddenException extends BaseCustomException {
  status = HttpStatus.FORBIDDEN;

  constructor(message: string) {
    super(message);
  }
}
