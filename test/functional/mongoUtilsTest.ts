import { expect } from 'chai';
import { constructMongoUri } from '../../src/utils/mongo';
import { AppConfig } from '../../src/config/appConfig';

describe('Test mongo URI construction', () => {
  it('Should construct valid mongo connection URI without user and password', () => {
    const testConfig: AppConfig = {
      serverPort(): string {
        throw new Error('Not Implemented');
      },
      openApiPath(): string {
        throw new Error('Not Implemented');
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
    const uri = constructMongoUri(testConfig);
    expect(uri).to.equal('mongodb://localhost:27017/lectern');
  });

  it('Should construct valid mongo connection URI with user and password', () => {
    const testConfig: AppConfig = {
      serverPort(): string {
        throw new Error('Not Implemented');
      },
      openApiPath(): string {
        throw new Error('Not Implemented');
      },
      mongoHost(): string {
        return 'localhost';
      },
      mongoPort(): string {
        return '27017';
      },
      mongoUser(): string {
        return 'foo';
      },
      mongoPassword(): string {
        return 'bar';
      },
      mongoDb(): string {
        return 'lectern';
      },
      mongoUrl(): string {
        return undefined;
      },
    };
    const uri = constructMongoUri(testConfig);
    expect(uri).to.equal('mongodb://foo:bar@localhost:27017/lectern?authSource=admin');
  });
});
