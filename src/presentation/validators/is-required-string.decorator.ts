import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

interface isStringOptions {
  min?: number;
  max?: number;
}

export function IsRequiredString(options: isStringOptions = {}): PropertyDecorator {
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

export function isOptionalString({ min, max }: isStringOptions = {}): PropertyDecorator {
  return applyDecorators(
    ValidateIf((_object: unknown, value: unknown) => value !== undefined),
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
