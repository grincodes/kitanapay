import {
  VersioningType,
  VERSION_NEUTRAL,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import passport from 'passport';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .addBearerAuth({ type: 'http' }, 'access-token')
    .setTitle('Kitana Pay')
    .setDescription('kitana-pay-api')
    .setVersion('1.0')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/v1/', app, document);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: [VERSION_NEUTRAL, '1'],
  });

  app.useGlobalPipes(new ValidationPipe());

  // app.disable('x-powered-by');
  app.enableCors();

  app.use(helmet());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());

  app.use(cookieParser());
  app.use(passport.initialize());

  await app.listen(port);
}
bootstrap();
