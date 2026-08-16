import { EnvironmentVariables } from 'src/common/config/env.types';
import { baseEnv } from 'src/common/config/environments/base.env';

export const developmentEnv = (): EnvironmentVariables => ({
  ...baseEnv(),
  port: 4000,
});
