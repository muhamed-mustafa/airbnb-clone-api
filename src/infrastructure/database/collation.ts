import type { CollationOptions } from 'mongodb';

export const CASE_INSENSITIVE_COLLATION: CollationOptions = {
  locale: 'en',
  strength: 2,
};
