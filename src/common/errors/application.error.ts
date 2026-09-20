export type ApplicationErrorCode =
  | 'INVALID_TOKEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_PHONE_NUMBER'
  | 'COUNTRY_ALREADY_EXISTS'
  | 'COUNTRY_NOT_FOUND';

export class ApplicationError extends Error {
  constructor(public readonly code: ApplicationErrorCode) {
    super(code);
    this.name = 'ApplicationError';
  }
}
