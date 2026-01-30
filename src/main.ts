import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './utils/interceptors/logger.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  const swagger = new DocumentBuilder()
    .setTitle('Ecomerce Application with NestJS - AppAPI')
    .setDescription('Your API Description')
    .addServer('http://localhost:5000')
    .setVersion('1.0')
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  // http://localhost:5000/swagger
  SwaggerModule.setup('swagger', app, documentation);
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
