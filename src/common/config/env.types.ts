export const NODE_ENVIRONMENTS = ['development', 'test', 'staging', 'production'] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export interface AppEnvironment {
  port: number;
  nodeEnv: NodeEnvironment;
}
export interface EnvironmentVariables {
  port: number;
  fullbackLanguage: string;
  MONGO_URI: string;
}
