import { type TransformFnParams } from 'class-transformer';

export const trimString = ({ value }: TransformFnParams): unknown => {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
};

type TransformValueParams = {
  value: unknown;
};

export function trimUppercaseString({ value }: TransformValueParams): unknown {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export function normalizeEmail({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  return value;
}
