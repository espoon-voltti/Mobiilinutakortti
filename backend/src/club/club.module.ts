import { Module } from '@nestjs/common';
import { ClubService } from './club.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Club, CheckIn } from './entities';
import { ClubController } from './club.controller';
import { Admin } from '../admin/entities';
import { jwt } from '../authentication/authentication.consts';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Junior, Club, CheckIn, Admin]),
  JwtModule.register({
    secret: jwt.secret,
  })],
  providers: [ClubService],
  controllers: [ClubController],
})
export class ClubModule { }
