import { EnvironmentVariables } from '@common/config/env.types';

export default (): EnvironmentVariables => ({
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: (process.env.NODE_ENV as EnvironmentVariables['NODE_ENV']) ?? 'development',
  FALLBACK_LANGUAGE: (process.env.FALLBACK_LANGUAGE as string) ?? 'en',
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN as string,
  INITIAL_ADMIN_NAME: (process.env.INITIAL_ADMIN_NAME as string) ?? 'Super Admin',
  INITIAL_ADMIN_EMAIL: (process.env.INITIAL_ADMIN_EMAIL as string) ?? 'admin@example.com',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD as string,
  FILE_STORAGE_PROVIDER:
    (process.env.FILE_STORAGE_PROVIDER as EnvironmentVariables['FILE_STORAGE_PROVIDER']) ??
    'cloudinary',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_S3_KEY_PREFIX: process.env.AWS_S3_KEY_PREFIX || 'airbnb/units',
  AWS_S3_BASE_URL: process.env.AWS_S3_BASE_URL,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
});
