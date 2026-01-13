import { NestFactory } from '@nestjs/core';
import { env } from './utils/env-validator';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

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
    console.log(error);
    process.exit(1);
  });
