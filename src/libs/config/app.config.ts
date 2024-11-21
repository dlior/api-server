import { merge } from 'lodash';
import { join, resolve } from 'path';

export const appConfig = async () => {
  const basePath = join(process.cwd(), 'dist/libs/config/env');
  const { default: sharedConfig } = await import(resolve(basePath, 'shared.json'));
  const { default: envConfig } = await import(resolve(basePath, `${process.env.NODE_ENV || 'dev'}.json`));
  return merge(sharedConfig, envConfig);
};
