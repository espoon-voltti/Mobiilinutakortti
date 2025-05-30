import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';
import { AdminModule } from '../admin/admin.module';
import { jwt } from './authentication.consts';
import { JwtStrategy } from './jwt.strategy';
import { JuniorModule } from '../junior/junior.module';

@Module({
  imports: [
    forwardRef(() => AdminModule),
    forwardRef(() => JuniorModule),
    PassportModule,
    JwtModule.register({
      secret: jwt.secret,
    }),
  ],
  providers: [AuthenticationService, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
