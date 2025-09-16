import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // ✅ Correct path - both pointing to the same location
  const flutterBuildPath = join(__dirname, '..', '..', 'build', 'web');
  
  // Debug info (remove after it works)
  console.log('🔍 Flutter build path:', flutterBuildPath);
  console.log('📁 Path exists:', existsSync(flutterBuildPath));
  console.log('📄 Index.html exists:', existsSync(join(flutterBuildPath, 'index.html')));
  
  // ✅ Serve static assets from the SAME path
  app.useStaticAssets(flutterBuildPath, {
    index: false,
  });
  
  app.use((req, res, next) => {
    if (req.method === 'GET' &&
        !req.path.startsWith('/api') &&
        !req.path.includes('.') &&
        req.accepts('html')) {
      // ✅ Serve index.html from the SAME path
      return res.sendFile(join(flutterBuildPath, 'index.html')); 
    }
    next();
  });
  
  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}
bootstrap();