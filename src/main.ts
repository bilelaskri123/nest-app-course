import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor } from './utils/interceptors/logger.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

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
  // Apply Middlewares
  app.use(helmet());

  // Cors Policy
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // swagger
  const swagger = new DocumentBuilder()
    .setTitle('Ecomerce Application with NestJS - AppAPI')
    .setDescription('Your API Description')
    .addServer('http://localhost:5000')
    .setVersion('1.0')
    .addSecurity('bearer', { type: 'http', scheme: 'bearer' })
    .addBearerAuth()
    .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  // http://localhost:5000/swagger
  SwaggerModule.setup('swagger', app, documentation);

  // Running the app
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
