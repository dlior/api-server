import { TestBed, Mocked } from '@suites/unit';

import { AppService } from '../services';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;
  let appService: Mocked<AppService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AppController).compile();
    appController = unit;
    appService = unitRef.get(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
      expect(appService).toBeDefined();
    });
  });
});
