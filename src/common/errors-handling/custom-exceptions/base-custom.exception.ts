import { HttpStatus } from '@nestjs/common';
import { ErrorResponseInterface } from '../error-response.interface';

export abstract class BaseCustomException extends Error {
  abstract status: HttpStatus;

  protected constructor(message: string) {
    super(message);
  }

  formatError(): ErrorResponseInterface[] {
    return [{ message: this.message }];
  }
}
