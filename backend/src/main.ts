import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { buildCorsOrigins } from './cors-origins';

/** Limite corps JSON (photos base64 sur /api/suivi/photo) — évite 413 Payload Too Large */
const BODY_LIMIT = '35mb';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.use(json({ limit: BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: BODY_LIMIT }));

  const port = Number(process.env.PORT) || 3001;

  // Static files (uploaded images): servis sous /uploads/<fichier>
  app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
    prefix: '/uploads',
    index: false,
  });

  const corsOrigins = buildCorsOrigins();
  if (corsOrigins.length === 0 && process.env.NODE_ENV === 'production') {
    new Logger('Bootstrap').warn(
      'CORS : définissez CORS_ORIGINS (ex. https://votre-app.vercel.app) et/ou FRONTEND_URL — sinon le navigateur bloquera les appels depuis le front.',
    );
  }
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📋 API Base URL: http://localhost:${port}/api`);
  console.log('📝 Available endpoints:');
  console.log('   - GET  /api/users');
  console.log('   - GET  /api/auth/verify-email?token=');
  console.log('   - POST /api/users/expert (multipart, inscription expert + CV)');
  console.log('   - POST /api/auth/analyze-cv (multipart, analyse CV — Gemini si GEMINI_API_KEY, sinon Anthropic)');
  console.log('   - POST /api/users/livreur (multipart, inscription livreur + CIN)');
  console.log('   - GET  /api/projects');
  console.log('   - GET  /api/suivi-projects');
  console.log('   - GET  /api/devis');
  console.log('   - GET  /api/marketplace/produits');
  console.log('   - GET  /api/marketplace/commandes');
}
bootstrap();
