import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { hostname } from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o site (Next.js) e o app mobile (Expo) consumirem a API
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Valida e sanitiza automaticamente todo DTO recebido nas rotas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // erro se enviar campo a mais
      transform: true, // converte tipos (ex: string -> number)
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3333;
  const host = process.env.HOSTNAME;
  await app.listen(port, host as string);

  console.log(`🪒 BRABUS BARBER API rodando em http://${host}:${port}/api`);
}
bootstrap();