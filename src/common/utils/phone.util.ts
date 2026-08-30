import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function parseAndValidatePhone(countryCode: string, phone: string): string | undefined {
  const phoneNumber = parsePhoneNumberFromString(`${countryCode}${phone}`);

  if (!phoneNumber?.isValid()) {
    return undefined;
  }

  return phoneNumber.number;
}
