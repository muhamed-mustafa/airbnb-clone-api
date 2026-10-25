import type { SchemaObject } from '@nestjs/swagger';

export const errorItemSchema: SchemaObject = {
  type: 'object',
  required: ['code', 'message'],
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
    field: { type: 'string' },
  },
};

export const errorsResponseSchema = (item: SchemaObject = errorItemSchema): SchemaObject => ({
  type: 'object',
  required: ['errors'],
  properties: { errors: { type: 'array', items: item } },
});
