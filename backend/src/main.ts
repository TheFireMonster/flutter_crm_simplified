import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  
  const flutterBuildPath = join(__dirname, '..', '..', 'build', 'web');

  
  console.log('🔍 Flutter build path:', flutterBuildPath);
  console.log('📁 Path exists:', existsSync(flutterBuildPath));
  console.log('📄 Index.html exists:', existsSync(join(flutterBuildPath, 'index.html')));

  app.useStaticAssets(flutterBuildPath, {
    index: false,
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/chat/') && req.path.endsWith('.js')) {
      const assetPath = req.path.replace('/chat/', '/');
      console.log('Rewriting asset request:', req.path, '->', assetPath);
      return res.sendFile(join(flutterBuildPath, assetPath));
    }
    next();
  });

  app.use((req, res, next) => {
    console.log('Request path:', req.path);
    next();
  });

  app.use((req, res, next) => {
    
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/chat/history') &&
      !req.path.startsWith('/chat/conversations') &&
      !req.path.startsWith('/appointments') &&
      !req.path.includes('.') &&
      req.accepts('html')
    ) {
      return res.sendFile(join(flutterBuildPath, 'index.html'));
    }
    next();
  });

  await app.listen(3000);
    console.log('Server running on http://localhost:3000');
}
bootstrap();