import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { ConfigHelper, toRedisClientOpts } from './configHandler';
import { JuniorModule } from './junior/junior.module';
import { JuniorController } from './junior/junior.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { Admin } from './admin/entities';
import { Junior } from './junior/entities';
import { ClubModule } from './club/club.module';
import { SmsModule } from './sms/sms.module';
import { RoutersMiddleware } from './middleware/routers.middleware';
import { ConfigModule } from '@nestjs/config';
import { SsoModule } from './sso/sso.module';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { AdSsoModule } from './ad-sso/ad-sso.module';
import { AdSsoController } from './ad-sso/ad-sso.controller';
import * as redis from 'redis';

const redisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const redisOptions = ConfigHelper.getRedisOptions();

    console.log('redisOptions', redisOptions);
    console.log(
      'toRedisClientOpts(redisOptions)',
      toRedisClientOpts(redisOptions),
    );

    const redisClient = redis.createClient(toRedisClientOpts(redisOptions));
    redisClient.on('error', (err) => console.log('Redis error', err));
    redisClient.connect().catch((err) => {
      console.log('Unable to connect to redis', err);
    });
    // Don't prevent the app from exiting if a redis connection is alive.
    redisClient.unref();

    return redisClient;
  },
};

@Module({
  imports: [
    TypeOrmModule.forRoot(ConfigHelper.getDatabaseConnection()),
    TypeOrmModule.forFeature([Admin, Junior]),
    AdminModule,
    JuniorModule,
    AuthenticationModule,
    RolesModule,
    ClubModule,
    SmsModule,
    AdSsoModule,
    SsoModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    LoggerModule.forRoot(),
  ],
  providers: [AppService, redisClientProvider],
  controllers: [
    AppController,
    AdminController,
    JuniorController,
    AuthenticationController,
    AdSsoController,
  ],
  exports: [redisClientProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RoutersMiddleware).forRoutes('/**');
  }

  constructor(private readonly connection: Connection) {}
}
