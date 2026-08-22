import { EnvironmentVariables } from '../../common/config/env.types';

export default (): EnvironmentVariables => ({
  PORT: Number(process.env.PORT ?? 3000),
  FALLBACK_LANGUAGE: (process.env.FALLBACK_LANGUAGE as string) ?? 'en',
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN as string,
});
