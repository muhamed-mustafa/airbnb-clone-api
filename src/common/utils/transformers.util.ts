import { type TransformFnParams } from 'class-transformer';

export const trimString = ({ value }: TransformFnParams): unknown => {
  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
};

export function normalizeEmail({ value }: TransformFnParams): unknown {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }

  return value;
}
