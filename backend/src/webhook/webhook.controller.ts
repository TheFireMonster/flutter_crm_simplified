import { Controller, Post, Body, Logger} from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    @Post()
    webhook(@Body() body: any) {
        this.logger.log('🔵 Webhook recebido:');
        this.logger.debug(JSON.stringify(body, null, 2));
        if (body.object === "page") {
            return 'EVENT_RECEIVED';
            this.logger.log('✅ Evento recebido com sucesso.');
        } else {}

    }
}