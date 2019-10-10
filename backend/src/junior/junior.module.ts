import { Module, forwardRef } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from './junior.entity';
import { JuniorController } from './junior.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AdminService } from '../admin/admin.service';
import { AdminModule } from '../admin/admin.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { Admin } from '../admin/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Junior]),
  forwardRef(() => AuthenticationModule), forwardRef(() => AdminModule)],
  controllers: [JuniorController],
  providers: [JuniorService],
  exports: [JuniorService],
})
export class JuniorModule { }
