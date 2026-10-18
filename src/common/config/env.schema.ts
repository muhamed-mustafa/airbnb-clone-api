import * as Joi from 'joi';
import { type EnvironmentVariables, FILE_STORAGE_PROVIDERS, NODE_ENVIRONMENTS } from './env.types';

export const envSchema: Joi.ObjectSchema<EnvironmentVariables> = Joi.object({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid(...NODE_ENVIRONMENTS)
    .default('development'),
  MONGO_URI: Joi.string().required(),
  FALLBACK_LANGUAGE: Joi.string().valid('en', 'ar').default('en'),
  JWT_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE_IN: Joi.string().default('15m'),
  REFRESH_TOKEN_EXPIRE_IN: Joi.string().default('30d'),
  INITIAL_ADMIN_NAME: Joi.string().default('Super Admin'),
  INITIAL_ADMIN_EMAIL: Joi.string().email().default('admin@example.com'),
  INITIAL_ADMIN_PASSWORD: Joi.string().min(8).required(),

  FILE_STORAGE_PROVIDER: Joi.string()
    .valid(...FILE_STORAGE_PROVIDERS)
    .default('cloudinary'),

  CLOUDINARY_CLOUD_NAME: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),

  CLOUDINARY_API_KEY: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),

  CLOUDINARY_API_SECRET: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 'cloudinary',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  AWS_REGION: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 's3',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('').optional(),
  }),

  AWS_S3_BUCKET: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 's3',
    then: Joi.string().required(),
    otherwise: Joi.string().allow('').optional(),
  }),

  AWS_ACCESS_KEY_ID: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 's3',
    then: Joi.string().optional().when('AWS_SECRET_ACCESS_KEY', {
      is: Joi.exist(),
      then: Joi.required(),
    }),
    otherwise: Joi.optional(),
  }),

  AWS_SECRET_ACCESS_KEY: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 's3',
    then: Joi.string().optional().when('AWS_ACCESS_KEY_ID', {
      is: Joi.exist(),
      then: Joi.required(),
    }),
    otherwise: Joi.optional(),
  }),
});
