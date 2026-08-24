import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom.exception';

export class NotFoundException extends BaseCustomException {
  status = HttpStatus.NOT_FOUND;

  constructor(message: string) {
    super(message);
  }
}
