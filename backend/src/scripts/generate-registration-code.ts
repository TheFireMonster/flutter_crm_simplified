import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RegistrationService } from '../registration/registration.service';

async function generateRegistrationCode() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const registrationService = app.get(RegistrationService);

  try {
    const code = await registrationService.generateRegistrationCode();
    const appUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const registrationLink = `${appUrl}/register/${code}`;
    
    console.log('✅ Código de registro gerado com sucesso!');
    console.log('📋 Código:', code);
    console.log('🔗 Link:', registrationLink);
    console.log('⏰ Expira em: 30 dias');
    
  } catch (error) {
    console.error('❌ Erro ao gerar código:', error.message);
  } finally {
    await app.close();
  }
}

generateRegistrationCode();