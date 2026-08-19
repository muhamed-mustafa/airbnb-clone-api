import * as Joi from 'joi';
import { type EnvironmentVariables, NODE_ENVIRONMENTS } from './env.types';

export const envSchema: Joi.ObjectSchema<EnvironmentVariables> = Joi.object({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid(...NODE_ENVIRONMENTS)
    .default('development'),
  MONGO_URI: Joi.string().required(),
  FALLBACK_LANGUAGE: Joi.string().valid('en', 'ar').default('en'),
  JWT_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE_IN: Joi.string().default('7d'),
});
