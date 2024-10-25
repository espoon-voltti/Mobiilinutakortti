import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SamlConfig, ValidateInResponseTo } from '@node-saml/node-saml';

export class ConfigHelper {
  static isTest() {
    return process.env.NODE_ENV === 'test';
  }

  static getJWTSecret(): string {
    return process.env.JWT || 'Remember to make me more secure before prod!';
  }

  static getDatabaseConnection(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.RDS_HOSTNAME || 'localhost',
      port: +process.env.RDS_PORT || 5432,
      username: process.env.RDS_USERNAME || 'postgres',
      password: process.env.RDS_PASSWORD || 'password',
      database: process.env.RDS_DB_NAME || 'nuta',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    };
  }

  static getFrontendPort(): string {
    return process.env.FRONTEND_BASE_URL || 'http://localhost:3001/';
  }

  static getAdminFrontEndBaseUrl(): string {
    return process.env.FRONTEND_BASE_URL || 'http://localhost:3002/';
  }

  static getApiBaseUrl(): string {
    return process.env.API_BASE_URL || 'http://localhost:3000/';
  }

  static getSamlConfig(): SamlConfig & { isMock: boolean } {
    const adType = [undefined, 'local', 'test'].some(
      (env) => process.env.NODE_ENV === env,
    )
      ? 'mock'
      : 'saml';
    // TODO: we need to support the fake for local environment and e2e tests
    if (adType === 'mock') {
      return {
        isMock: true,
        entryPoint: 'http://localhost:3000/saml-auth/fake-login',
        issuer: 'mock-issuer',
        callbackUrl: 'http://localhost:3000/saml-auth/callback',
        idpCert: 'fake cert',
      };
    }
    return {
      isMock: false,
      callbackUrl: process.env.AD_SAML_CALLBACK_URL,
      logoutCallbackUrl: process.env.AD_SAML_LOGOUT_CALLBACK_URL,
      entryPoint: process.env.AD_SAML_ENTRYPOINT_URL,
      logoutUrl: process.env.AD_SAML_LOGOUT_URL,
      issuer: process.env.AD_SAML_ISSUER,
      publicCert: process.env.AD_SAML_PUBLIC_CERT,
      idpCert: process.env.AD_SAML_IDP_CERT,
      privateKey: process.env.AD_SAML_PRIVATE_CERT,
      validateInResponseTo: ValidateInResponseTo.never,
      signatureAlgorithm: 'sha256',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      acceptedClockSkewMs: 0,
      disableRequestedAuthnContext: true,
      // When *both* wantXXXXSigned settings are false, passport-saml still
      // requires at least the whole response *or* the assertion to be signed, so
      // these settings don't introduce a security problem
      wantAssertionsSigned: false,
      wantAuthnResponseSigned: false,
    };
  }
}
