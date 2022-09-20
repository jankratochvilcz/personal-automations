import { NestFactory } from '@nestjs/core';
import { BitBucketModule } from './bitBucket.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(BitBucketModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Personal Automations')
    .setDescription('Automations to remove routine work for better focus')
    .setVersion('1.0')
    .addServer('https://little-river-5796.fly.dev/', 'Production')
    .addServer('http://localhost:3000/', 'Debug')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
