import { forwardRef, Module } from '@nestjs/common';
import { AdSsoController } from './ad-sso.controller';
import { AdSsoService } from './ad-sso.service';
import { AdminModule } from 'src/admin/admin.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { AppModule } from 'src/app.module';

@Module({
  // Skip passport use plain node saml
  // imports: [
  //   PassportModule.register({ defaultStrategy: 'saml', session: true }), // SAML strategy is default in this module
  // ],
  imports: [
    forwardRef(() => AppModule),
    forwardRef(() => AdminModule),
    forwardRef(() => AuthenticationModule),
  ],
  controllers: [AdSsoController],
  providers: [AdSsoService],
  exports: [AdSsoService],
})
export class AdSsoModule {}
