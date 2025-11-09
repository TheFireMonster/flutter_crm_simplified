import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  
  const flutterBuildPath = join(__dirname, '..', '..', 'build', 'web');

  
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Flutter build path:', flutterBuildPath);
    console.log('📁 Path exists:', existsSync(flutterBuildPath));
    console.log('📄 Index.html exists:', existsSync(join(flutterBuildPath, 'index.html')));
  }

  app.useStaticAssets(flutterBuildPath, {
    index: false,
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/chat/') && req.path.endsWith('.js')) {
      const assetPath = req.path.replace('/chat/', '/');
      if (process.env.NODE_ENV !== 'production') {
        console.log('Rewriting asset request:', req.path, '->', assetPath);
      }
      return res.sendFile(join(flutterBuildPath, assetPath));
    }
    next();
  });

  app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Request path:', req.path);
    }
    next();
  });

  app.use((req, res, next) => {
    
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/chat/history') &&
      !req.path.startsWith('/chat/conversations') &&
      !req.path.startsWith('/appointments') &&
      !req.path.startsWith('/services') &&
      !req.path.startsWith('/customers') &&
      !req.path.startsWith('/sales') &&
      !req.path.startsWith('/chartai') &&
      !req.path.includes('.') &&
      req.accepts('html')
    ) {
      return res.sendFile(join(flutterBuildPath, 'index.html'));
    }
    next();
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on ${process.env.API_BASE_URL || `http://localhost:${port}`}`);
  }
}
bootstrap();