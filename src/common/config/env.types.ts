export const NODE_ENVIRONMENTS = ['development', 'test', 'staging', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export const FILE_STORAGE_PROVIDERS = ['cloudinary', 's3'] as const;

export type FileStorageProvider = (typeof FILE_STORAGE_PROVIDERS)[number];

export interface AppEnvironment {
  port: number;
  nodeEnv: NodeEnvironment;
}
export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: NodeEnvironment;
  FALLBACK_LANGUAGE: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRE_IN: string;
  REFRESH_TOKEN_EXPIRE_IN: string;
  INITIAL_ADMIN_NAME: string;
  INITIAL_ADMIN_EMAIL: string;
  INITIAL_ADMIN_PASSWORD: string;

  FILE_STORAGE_PROVIDER: FileStorageProvider;

  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;

  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}
