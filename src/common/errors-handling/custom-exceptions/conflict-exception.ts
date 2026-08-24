import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class ConflictException extends BaseCustomException {
  constructor(message: string, status: HttpStatus = HttpStatus.CONFLICT) {
    super(message, status);
  }
}
