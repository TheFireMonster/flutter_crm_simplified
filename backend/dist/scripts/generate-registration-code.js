"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const registration_service_1 = require("../registration/registration.service");
async function generateRegistrationCode() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const registrationService = app.get(registration_service_1.RegistrationService);
    try {
        const code = await registrationService.generateRegistrationCode();
        const appUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        const registrationLink = `${appUrl}/register/${code}`;
        console.log('✅ Código de registro gerado com sucesso!');
        console.log('📋 Código:', code);
        console.log('🔗 Link:', registrationLink);
        console.log('⏰ Expira em: 30 dias');
    }
    catch (error) {
        console.error('❌ Erro ao gerar código:', error.message);
    }
    finally {
        await app.close();
    }
}
generateRegistrationCode();
//# sourceMappingURL=generate-registration-code.js.map