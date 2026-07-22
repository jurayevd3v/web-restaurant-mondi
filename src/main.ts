import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

const start = async () => {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });

    const nodeEnv = process.env.NODE_ENV || 'development';
    const isProd = nodeEnv === 'production';

    // .env: ALLOWED_ORIGINS=https://example.uz,https://admin.example.uz
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const corsLogger = new Logger('CORS');
    const appLogger = new Logger('Bootstrap');

    appLogger.log(`Allowed origins: ${JSON.stringify(allowedOrigins)}`);

    app.use(helmet());

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (!isProd && allowedOrigins.length === 0) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          corsLogger.warn(`Blocked origin: ${origin}`);
          callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const PORT = process.env.API_PORT || 9999;

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use((req, res, next) => {
      const startTime = Date.now();
      res.on('finish', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(
          `${req.method} ${req.originalUrl} ${res.statusCode}, ${responseTime}ms`,
        );
      });
      next();
    });

    // === SWAGGER: faqat production emasda ochiq ===
    if (!isProd) {
      const config = new DocumentBuilder()
        .setTitle('Darxon API')
        .setDescription('The Darxon API documentation')
        .setVersion('0.0.1')
        .addBearerAuth()
        .addApiKey(
          {
            type: 'apiKey',
            name: 'x-admin-secret',
            in: 'header',
          },
          'admin-secret', // shu nom bilan controllerda ishlatamiz
        )
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      appLogger.log(
        `Swagger documentation available at: http://localhost:${PORT}/api/docs`,
      );
    }

    // Serverni ishga tushirish
    await app.listen(PORT);
    appLogger.log(`Application is running on: http://localhost:${PORT}/api`);
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();
