import { envSchema } from './env.schema';
import type { AppEnvironment } from './env.types';

export function appConfig(): AppEnvironment {
  const result = envSchema.validate(
    {
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
    },
    {
      abortEarly: false,
      convert: true,
    },
  );

  if (result.error) {
    throw new Error(`Config validation error: ${result.error.message}`);
  }

  return {
    port: result.value.PORT,
    nodeEnv: result.value.NODE_ENV,
  };
}
