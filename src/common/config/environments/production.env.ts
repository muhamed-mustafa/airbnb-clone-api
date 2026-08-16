import { EnvironmentVariables } from 'src/common/config/env.types';
import { baseEnv } from 'src/common/config/environments/base.env';

export const productionEnv = (): EnvironmentVariables => ({
  ...baseEnv(),
  port: 7000,
});
