interface DuplicateKeyError {
  code: number;
  keyPattern: Record<string, unknown>;
}

export const isDuplicateKeyError = (error: unknown): error is DuplicateKeyError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000 &&
  'keyPattern' in error &&
  typeof error.keyPattern === 'object' &&
  error.keyPattern !== null;

export const getDuplicateKeyField = (error: unknown): string | undefined => {
  if (!isDuplicateKeyError(error)) {
    return undefined;
  }

  return Object.keys(error.keyPattern)[0];
};
