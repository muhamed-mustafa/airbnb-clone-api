import { registerAs } from '@nestjs/config';
import { NodeEnvironment } from 'src/common/config/env.types';

export default registerAs('app', () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const nodeEnv = (process.env.NODE_ENV as NodeEnvironment) || 'development';

  return {
    port,
    nodeEnv,
  };
});
