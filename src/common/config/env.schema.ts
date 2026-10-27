import * as Joi from 'joi';
import { type EnvironmentVariables, FILE_STORAGE_PROVIDERS, NODE_ENVIRONMENTS } from './env.types';

export const envSchema: Joi.ObjectSchema<EnvironmentVariables> = Joi.object<EnvironmentVariables>({
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

  AWS_S3_BASE_URL: Joi.when('FILE_STORAGE_PROVIDER', {
    is: 's3',
    then: Joi.string()
      .uri({ scheme: ['https'] })
      .custom((value: string, helpers) => {
        const url = new URL(value);
        if (url.username || url.password || url.search || url.hash)
          return helpers.error('any.invalid');
        return value;
      })
      .required(),
    otherwise: Joi.string().allow('').optional(),
  }),
  AWS_S3_KEY_PREFIX: Joi.string()
    .empty('')
    .pattern(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/)
    .default('airbnb/units'),
  AWS_ACCESS_KEY_ID: Joi.string().empty('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().empty('').optional(),
  AWS_SESSION_TOKEN: Joi.string().empty('').optional(),
}).and('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY');
