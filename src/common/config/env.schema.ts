import * as Joi from 'joi';
import { type EnvironmentVariables, NODE_ENVIRONMENTS } from './env.types';

export const envSchema: Joi.ObjectSchema<EnvironmentVariables> = Joi.object({
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string()
    .valid(...NODE_ENVIRONMENTS)
    .default('development'),
});
