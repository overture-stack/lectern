import App from '../../src/app';
import { expect } from 'chai';
import { AppConfig, getAppConfig } from '../../src/config/appConfig';

describe('Test injection of config into Express App', () => {
  it('Should have correct port and api docs path set', () => {
    const testConfig: AppConfig = {
      serverPort(): string {
        return '54321';
      },
      openApiPath(): string {
        return '/test-path';
      },
      mongoHost(): string {
        return 'localhost';
      },
      mongoPort(): string {
        return '27017';
      },
      mongoUser(): string {
        return undefined;
      },
      mongoPassword(): string {
        return undefined;
      },
      mongoDb(): string {
        return 'lectern';
      },
      mongoUrl(): string {
        return undefined;
      },
    };

    const app = App(testConfig);
    const swaggerRoute = app._router.stack.filter((layer: any) => layer.name == 'swaggerInitFn')[0];
    expect(String(swaggerRoute.regexp)).to.contain('/test-path');
    expect(app.get('port')).to.be.equal('54321');
  });
});
