export const NODE_ENVIRONMENTS = [
  'development',
  'test',
  'staging',
  'production',
] as const;

export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export interface AppEnvironment {
  port: number;
  nodeEnv: NodeEnvironment;
}
export interface EnvironmentVariables {
  PORT: number;
  NODE_ENV: NodeEnvironment;
}
