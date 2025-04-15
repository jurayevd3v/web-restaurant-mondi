import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const start = async () => {
  try {
    const app = await NestFactory.create(AppModule, { cors: true });
    
    app.enableCors({
      origin: true,
      methods: 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS',
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const PORT = process.env.API_PORT || 9999;

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.use((req, res, next) => {
      const startTime = Date.now();
      res.on('finish', () => {``
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        console.log(
          `${req.method} ${req.originalUrl} ${res.statusCode}, ${responseTime}ms`,
        );
      });
      next();
    });

    const config = new DocumentBuilder()
      .setTitle('Mondi')
      .setDescription('jurayevdev')
      .setVersion('0.0.1')
      .addTag('NodeJs, NestJs, Postgres, Sequalize')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    app.listen(PORT, () => {
      console.log(`${PORT} --- portda server ishga tushdi`);
    });
  } catch (err) {
    console.log(err);
  }
};

start();