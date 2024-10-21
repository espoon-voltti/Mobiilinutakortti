import { Module } from '@nestjs/common';
import { AdSsoController } from './ad-sso.controller';
import { PassportModule } from '@nestjs/passport';
import { SamlStrategy } from './saml.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'saml', session: true }), // SAML strategy is default in this module
  ],
  controllers: [AdSsoController],
  providers: [SamlStrategy],
})
export class AdSsoModule {}
