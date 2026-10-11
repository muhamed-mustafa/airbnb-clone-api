export const modelNames = {
  ADMINS: 'Admin',
  APP_SETTINGS: 'AppSettings',
  REFRESH_TOKENS: 'RefreshToken',
  COUNTRIES: 'Country',
  CITIES: 'City',
  CURRENCIES: 'Currency',
  UNIT_CATEGORIES: 'UnitCategory',
  UNITS: 'Unit',
  USERS: 'User',
} as const;

export type ModelName = (typeof modelNames)[keyof typeof modelNames];
