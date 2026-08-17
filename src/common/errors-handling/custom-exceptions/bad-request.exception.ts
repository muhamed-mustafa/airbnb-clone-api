import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class BadRequestException extends BaseCustomException {
  status = HttpStatus.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}
