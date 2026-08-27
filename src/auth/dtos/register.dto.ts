import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @Transform(({ value }: TransformFnParams): unknown => {
    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  @MinLength(2, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  name!: string;

  @Transform(({ value }: TransformFnParams): unknown => {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }

    return value;
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty'),
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail'),
    },
  )
  email!: string;

  @Transform(({ value }: TransformFnParams): unknown => {
    if (typeof value === 'string') {
      return value.trim();
    }

    return value;
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  countryCode!: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  phone!: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.isNotEmpty'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  @MinLength(8, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @MaxLength(128, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: i18nValidationMessage('validation.password'),
  })
  password!: string;
}
