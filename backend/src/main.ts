import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: restrict in production
  app.enableCors({ origin: '*' });

  // ValidationPipe intentionally not added
  await app.listen(3000);
  console.log('Server running on port 3000');
}
bootstrap();
