import { EnvironmentVariables } from 'src/common/config/env.types';

export const baseEnv = (): EnvironmentVariables => ({
  PORT: Number(process.env.PORT),
  FALLBACK_LANGUAGE: process.env.FALLBACK_LANGUAGE as string,
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN as string,
});
