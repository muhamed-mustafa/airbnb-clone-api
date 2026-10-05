import { EnvironmentVariables } from '@common/config/env.types';

export const baseEnv = (): EnvironmentVariables => ({
  PORT: Number(process.env.PORT),
  NODE_ENV: process.env.NODE_ENV as EnvironmentVariables['NODE_ENV'],
  FALLBACK_LANGUAGE: process.env.FALLBACK_LANGUAGE as string,
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN as string,
  INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME as string,
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL as string,
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD as string,
});
