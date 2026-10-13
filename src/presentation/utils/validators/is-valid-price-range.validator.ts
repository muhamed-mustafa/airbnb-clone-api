import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsValidPriceRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPriceRange',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const { minPrice, maxPrice } = args.object as {
            minPrice?: number;
            maxPrice?: number;
          };

          return minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice;
        },
      },
    });
  };
}
