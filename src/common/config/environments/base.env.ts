import { EnvironmentVariables } from 'src/common/config/env.types';

export const baseEnv = (): EnvironmentVariables => ({
  port: Number(process.env.PORT),
});
