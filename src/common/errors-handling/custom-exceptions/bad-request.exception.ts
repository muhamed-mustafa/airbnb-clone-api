import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class BadRequestException extends BaseCustomException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}
