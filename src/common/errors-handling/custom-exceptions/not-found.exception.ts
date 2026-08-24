import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class NotFoundException extends BaseCustomException {
  constructor(message: string, status: HttpStatus = HttpStatus.NOT_FOUND) {
    super(message, status);
  }
}
