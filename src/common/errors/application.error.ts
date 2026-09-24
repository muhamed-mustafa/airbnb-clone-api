import { ERROR_CODES } from './error-codes';

export type ApplicationErrorCode = keyof Pick<
  typeof ERROR_CODES,
  | 'INVALID_TOKEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_PHONE_NUMBER'
  | 'COUNTRY_ALREADY_EXISTS'
  | 'COUNTRY_NOT_FOUND'
  | 'CITY_ALREADY_EXISTS'
  | 'CITY_NOT_FOUND'
  | 'CURRENCY_ALREADY_EXISTS'
  | 'CURRENCY_NOT_FOUND'
>;

export class ApplicationError extends Error {
  constructor(public readonly code: ApplicationErrorCode) {
    super(code);
    this.name = 'ApplicationError';
  }
}
