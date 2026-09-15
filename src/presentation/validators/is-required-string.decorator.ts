import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

interface IsRequiredStringOptions {
  min?: number;
  max?: number;
}

export function IsRequiredString(options: IsRequiredStringOptions = {}): PropertyDecorator {
  const { min, max } = options;

  return applyDecorators(
    IsNotEmpty({
      message: i18nValidationMessage('validation.isNotEmpty'),
    }),
    IsString({
      message: i18nValidationMessage('validation.isString'),
    }),
    ...(min !== undefined
      ? [
          MinLength(min, {
            message: i18nValidationMessage('validation.minLength'),
          }),
        ]
      : []),
    ...(max !== undefined
      ? [
          MaxLength(max, {
            message: i18nValidationMessage('validation.maxLength'),
          }),
        ]
      : []),
  );
}
