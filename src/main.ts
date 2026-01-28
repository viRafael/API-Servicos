import { NestFactory } from '@nestjs/core';
import { env } from './utils/env-validator';
import { AppModule } from './app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  app.use('/webhooks/stripe', bodyParser.raw({ type: 'application/json' }));
  app.use(express.json());

  await app.listen(env.PORT);
}

bootstrap()
  .then(() => {
    console.log(
      `[API-SERVIÇOS]\n
      Servidor rodando em: http://localhost:${env.PORT} 
      Documentação rodando em: http://localhost:${env.PORT}/docs`,
    );
  })
  .catch((error) => {
    const logger = new Logger('Bootstrap');
    logger.error(error);
    process.exit(1);
  });
