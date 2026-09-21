import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { i18nValidationMessage } from 'nestjs-i18n';

@ValidatorConstraint({
  name: 'atLeastOneField',
  async: false,
})
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const [fields] = args.constraints as [string[]];

    const object = args.object as Record<string, unknown>;

    return fields.some((field) => object[field] !== undefined);
  }

  defaultMessage(args: ValidationArguments): string {
    return i18nValidationMessage('validation.atLeastOneField')(args);
  }
}

export function AtLeastOneField(
  fields: string[],
  options: ValidationOptions = {},
): PropertyDecorator {
  return (target, propertyKey) => {
    registerDecorator({
      name: 'atLeastOneField',
      target: target.constructor,
      propertyName: propertyKey.toString(),
      constraints: [fields],
      options: {
        always: true,
        ...options,
      },
      validator: AtLeastOneFieldConstraint,
    });
  };
}
