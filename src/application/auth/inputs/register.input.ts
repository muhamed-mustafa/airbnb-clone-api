export interface RegisterInput {
  language?: 'ar' | 'en';
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
}
