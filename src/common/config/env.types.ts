export const NODE_ENVIRONMENTS = ['development', 'test', 'staging', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export interface AppEnvironment {
  port: number;
  nodeEnv: NodeEnvironment;
}
export interface EnvironmentVariables {
  PORT: number;
  FALLBACK_LANGUAGE: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRE_IN: string;
  REFRESH_TOKEN_EXPIRE_IN: string;
}
