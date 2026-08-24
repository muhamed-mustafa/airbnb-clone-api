import { EnvironmentVariables } from '../../common/config/env.types';
import { developmentEnv } from './environments/development.env';
import { productionEnv } from './environments/production.env';
import { stagingEnv } from './environments/staging.env';
import { testEnv } from './environments/test.env';

const environmentConfig: Record<string, () => EnvironmentVariables> = {
  development: developmentEnv,
  test: testEnv,
  staging: stagingEnv,
  production: productionEnv,
};

export default (): EnvironmentVariables => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envConfig = environmentConfig[nodeEnv];

  if (!envConfig) {
    throw new Error(`Invalid NODE_ENV value: ${nodeEnv}`);
  }

  return envConfig();
};
