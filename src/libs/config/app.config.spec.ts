import path from 'path';

import { appConfig } from './app.config';

describe('appConfig', () => {
  let sharedConfig: Record<string, any>;
  let envConfig: Record<string, any>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    sharedConfig = {
      ports: {
        app: 8085,
        healthCheckApp: 11666,
      },
      vault: {
        pg: '/secret/stg',
      },
    };
    envConfig = {
      dev: {
        vault: {
          pg: '/secret/dev',
        },
      },
      stg: {
        vault: {
          pg: '/secret/stg',
        },
      },
    };
  });
  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it.each([['dev'], ['stg']])('should return the app %s configuration', async (env) => {
    process.env = { ...originalEnv, NODE_ENV: env };
    jest.spyOn(path, 'join').mockReturnValue('/path/to/env');
    jest
      .spyOn(path, 'resolve')
      .mockReturnValueOnce('/path/to/env/shared.json')
      .mockReturnValueOnce(`/path/to/env/${process.env.NODE_ENV}.json`);
    jest.doMock('/path/to/env/shared.json', () => sharedConfig, { virtual: true });
    jest.doMock(`/path/to/env/${process.env.NODE_ENV}.json`, () => envConfig[process.env.NODE_ENV!], {
      virtual: true,
    });

    await expect(appConfig()).resolves.toStrictEqual({
      ports: {
        app: 8085,
        healthCheckApp: 11666,
      },
      vault: {
        pg: `/secret/${process.env.NODE_ENV}`,
      },
    });
  });

  it('should return the app dev configuration when NODE_ENV is undefined', async () => {
    process.env = { ...originalEnv, NODE_ENV: undefined };
    jest.spyOn(path, 'join').mockReturnValue('/path/to/env');
    jest.spyOn(path, 'resolve').mockReturnValueOnce('/path/to/env/shared.json');
    jest.doMock('/path/to/env/shared.json', () => sharedConfig, { virtual: true });
    jest.doMock(`/path/to/env/${process.env.NODE_ENV || 'dev'}.json`, () => envConfig[process.env.NODE_ENV || 'dev'], {
      virtual: true,
    });

    await expect(appConfig()).resolves.toStrictEqual({
      ports: {
        app: 8085,
        healthCheckApp: 11666,
      },
      vault: {
        pg: '/secret/dev',
      },
    });
  });
});
