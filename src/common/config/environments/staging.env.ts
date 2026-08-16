import { EnvironmentVariables } from 'src/common/config/env.types';
import { baseEnv } from 'src/common/config/environments/base.env';

export const stagingEnv = (): EnvironmentVariables => ({
  ...baseEnv(),
  port: 8000,
});
