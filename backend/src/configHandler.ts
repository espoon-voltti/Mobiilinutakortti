import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SamlConfig } from '@node-saml/node-saml';

export declare enum ValidateInResponseTo {
  never = "never",
  ifPresent = "ifPresent",
  always = "always"
}

export interface EspooSamlConfig extends BaseSamlConfig {
  externalIdPrefix: string
  userIdKey: string
  callbackUrl: string
  entryPoint: string
  logoutUrl: string
  issuer: string
  publicCert: string | string[]
  privateCert: string
  validateInResponseTo: ValidateInResponseTo
  decryptAssertions: boolean
  nameIdFormat?: string | undefined
  cert?: string | undefined
}

interface BaseSamlConfig {
  entryPoint: string, // Mock entry point
        issuer: string,
        callbackUrl: string, // Same callback URL
}

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
        return process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
    }

    static getSamlConfig(): SamlConfig {
      const adType = [undefined, 'local', 'test'].some((env) => process.env.NODE_ENV === env) ? 'mock' : 'saml'
      if(adType === 'mock'){
        return {
          entryPoint: 'http://localhost:3000/saml-auth/fake-login', 
          issuer: 'mock-issuer',
          callbackUrl: 'http://localhost:3000/saml-auth/callback',
          idpCert: 'fake cert'
        }
      }
      return  {
        callbackUrl: process.env.AD_SAML_CALLBACK_URL,
        entryPoint: process.env.AD_SAML_ENTRYPOINT_URL,
        logoutUrl: process.env.AD_SAML_LOGOUT_URL,
        issuer: process.env.AD_SAML_ISSUER,
        idpCert:  process.env.AD_PUBLIC_CERT,
        privateKey: process.env.AD_SAML_PRIVATE_CERT,
        validateInResponseTo: ValidateInResponseTo.always,
        disableRequestedAuthnContext: true,
        signatureAlgorithm: 'sha256',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
        // When *both* wantXXXXSigned settings are false, passport-saml still
        // requires at least the whole response *or* the assertion to be signed, so
        // these settings don't introduce a security problem
        wantAssertionsSigned: false,
        wantAuthnResponseSigned: false
      }
  }
}

function envArray<T>(
  key: string,
  parser: (value: string) => T,
  separator = ','
): T[] | undefined {
  const value = process.env[key]
  if (value === undefined || value === '') return undefined
  const values = value.split(separator)
  try {
    return values.map(parser)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`${message}: ${key}=${value}`)
  }
}

function required<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Configuration parameter was not provided')
  }
  return value
}

function env<T>(key: string, parser: (value: string) => T): T | undefined {
  const value = process.env[key]
  if (value === undefined || value === '') return undefined
  try {
    return parser(value)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`${message}: ${key}=${value}`)
  }
}

const booleans: Record<string, boolean> = {
  1: true,
  0: false,
  true: true,
  false: false
}

function parseBoolean(value: string): boolean {
  if (value in booleans) return booleans[value]
  throw new Error('Invalid boolean')
}

