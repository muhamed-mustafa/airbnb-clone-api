interface DuplicateKeyError {
  code: number;
  keyPattern: Record<string, unknown>;
}

export const isDuplicateKeyError = (error: unknown): error is DuplicateKeyError =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;

export const getDuplicateKeyField = (error: unknown): string | undefined => {
  if (isDuplicateKeyError(error)) {
    return Object.keys(error.keyPattern ?? {})[0];
  }

  return undefined;
};
