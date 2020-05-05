import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import { ConfigHelper } from './configHandler';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // This is for local development only.
  // In test and production environments the HTTPS is provided by a separate AWS load balancer.
  let httpsOptions = null;
  if (fs.existsSync('./certs/nutakortti-test_private_key.pem')) {
    httpsOptions = {
      key: fs.readFileSync('./certs/nutakortti-test_private_key.pem'),
      cert: fs.readFileSync('./certs/nutakortti-test.cer'),
    };
  }

  const app = httpsOptions ?
    await NestFactory.create(AppModule, { httpsOptions }) :
    await NestFactory.create(AppModule);
  app.enableCors();
  app.use('/', express.static(join(__dirname, '..', 'public')));
  app.use('/', express.static(join(__dirname, '..', 'public-admin')));
  app.use(cookieParser());
  await app.listen(process.env.APPLICATION_PORT || 3000);
}
bootstrap();
