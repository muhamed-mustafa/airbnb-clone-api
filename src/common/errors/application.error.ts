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
  | 'UNIT_CATEGORY_ALREADY_EXISTS'
  | 'UNIT_CATEGORY_NOT_FOUND'
  | 'APP_SETTINGS_NOT_FOUND'
  | 'ADMIN_NOT_FOUND'
  | 'UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE'
  | 'UNIT_NOT_FOUND'
  | 'UNIT_ACCESS_DENIED'
  | 'CITY_COUNTRY_MISMATCH'
>;

export class ApplicationError extends Error {
  constructor(public readonly code: ApplicationErrorCode) {
    super(code);
    this.name = 'ApplicationError';
  }
}
