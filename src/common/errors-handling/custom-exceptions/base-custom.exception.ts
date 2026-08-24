import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseInterface } from '../error-response.interface';

export abstract class BaseCustomException extends HttpException {
  protected constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }

  formatError(): ErrorResponseInterface[] {
    return [{ message: this.message }];
  }
}
