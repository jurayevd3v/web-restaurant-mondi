import * as crypto from 'crypto';
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';

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
    const swaggerLogger = new Logger('Swagger');
    const appLogger = new Logger('Bootstrap');

    appLogger.log(`Allowed origins: ${JSON.stringify(allowedOrigins)}`);

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
    app.useGlobalPipes(new ValidationPipe());
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

    // === SWAGGER: faqat ruxsat etilgan originlar uchun ochiq ===
    const swaggerGuard = (req: Request, res: Response, next: NextFunction) => {
      if (!isProd && allowedOrigins.length === 0) {
        next();
        return;
      }

      const origin = (req.headers.origin ||
        req.headers.referer ||
        '') as string;

      // So'rov kelgan manzil ruxsat etilganlar ro'yxatida borligini tekshirish
      const originAllowed = allowedOrigins.some((o) => origin.startsWith(o));

      if (originAllowed) {
        next();
      } else {
        swaggerLogger.warn(`Blocked Swagger access from origin: ${origin}`);
        res
          .status(403)
          .send('Forbidden: Access to Swagger documentation is restricted.');
      }
    };

    // Swagger guard'ni faqat hujjatlar yo'liga qo'llaymiz
    app.use('/api/docs', swaggerGuard);

    // Swagger sozlamalari
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

    // Serverni ishga tushirish
    await app.listen(PORT);
    appLogger.log(`Application is running on: http://localhost:${PORT}/api`);
    appLogger.log(
      `Swagger documentation available at: http://localhost:${PORT}/api/docs`,
    );
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();
