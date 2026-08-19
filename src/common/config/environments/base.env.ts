import { EnvironmentVariables } from 'src/common/config/env.types';

export const baseEnv = (): EnvironmentVariables => ({
  port: Number(process.env.PORT),
  fallbackLanguage: process.env.FALLBACK_LANGUAGE as string,
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
});
