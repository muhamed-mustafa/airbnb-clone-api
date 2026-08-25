import { ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ErrorResponseInterface } from '../error-response.interface';

export function formatInputValidationErrors(
  errors: ValidationError[],
  i18n: I18nService,
  host: ArgumentsHost,
): ErrorResponseInterface[] {
  const lang = I18nContext.current(host)?.lang ?? 'en';

  return errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map((code) => ({
      code,
      field: error.property,
      message: i18n.translate(code, { lang }),
    })),
  );
}
