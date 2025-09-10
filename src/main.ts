import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { ResponseInterceptor } from './features/shared/interceptors';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const logger = new Logger('main');

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes( new ValidationPipe( { whitelist : true } ) );
  app.useGlobalInterceptors( new ResponseInterceptor() );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
  });

  await app.listen(process.env.PORT ?? 3000);

  logger.log(`App running on port ${process.env.PORT}`);
}

bootstrap();