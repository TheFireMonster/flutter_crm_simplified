"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const service_service_1 = require("../../services/service.service");
const appointments_service_1 = require("../../appointments/appointments.service");
const customers_ai_service_1 = require("../../customers/customers.ai.service");
const appointments_ai_service_1 = require("../../appointments/appointments.ai.service");
const chat_service_1 = require("../../chat/chat.service");
let AIChatService = class AIChatService {
    httpService;
    configService;
    serviceService;
    appointmentsService;
    customersAiService;
    appointmentsAiService;
    chatService;
    constructor(httpService, configService, serviceService, appointmentsService, customersAiService, appointmentsAiService, chatService) {
        this.httpService = httpService;
        this.configService = configService;
        this.serviceService = serviceService;
        this.appointmentsService = appointmentsService;
        this.customersAiService = customersAiService;
        this.appointmentsAiService = appointmentsAiService;
        this.chatService = chatService;
    }
    async ask(prompt, conversationId, customerName) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        let services = [];
        let appointments = [];
        try {
            services = await this.serviceService.findAll();
        }
        catch (err) {
            console.error('AIChatService: failed to load services, continuing with empty list', err);
            services = [];
        }
        try {
            appointments = await this.appointmentsService.getAll();
        }
        catch (err) {
            console.error('AIChatService: failed to load appointments, continuing with empty list', err);
            appointments = [];
        }
        const productList = services.map(p => p.serviceName).join(', ');
        const appointmentList = appointments.map(a => `${a.title} em ${a.appointmentDate}`).join('; ');
        let systemPrompt = 'Você é um assistente CRM útil. Sempre responda em português. ' +
            'Produtos/Serviços disponíveis: ' + productList + '. ' +
            'Use o ' + appointmentList + ' como referência dos dias e horários indisponíveis. Caso não encontre um agendamento criado em determinado dia ou horário, informe que está disponível.';
        'Ajude os clientes/pacientes a agendar consultas e resolver problemas.' +
            'Não crie agendamentos ou clientes fictícios, apenas sugira quando apropriado.';
        'Não presuma coisas sobre as quais você não tem certeza. Se não souber a resposta, diga que não sabe.';
        if (customerName) {
            systemPrompt += `\nNome do cliente: ${customerName}. Use isto para personalizar respostas quando apropriado.`;
        }
        const messages = [];
        messages.push({ role: 'system', content: systemPrompt });
        if (conversationId) {
            try {
                const history = await this.chatService.getRecentMessages(conversationId, 20);
                for (const m of history) {
                    const role = (m.sender === 'staff' || m.sender?.toLowerCase().includes('ai')) ? 'assistant' : 'user';
                    messages.push({ role, content: m.content });
                }
            }
            catch (e) {
                console.error('AIChatService: failed to load message history', e);
            }
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    ...messages,
                    { role: 'user', content: prompt }
                ],
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }));
            const choice = response?.data?.choices?.[0];
            const message = choice?.message;
            if (message?.function_call) {
                try {
                    const fnName = message.function_call.name;
                    const args = JSON.parse(message.function_call.arguments || '{}');
                    if (fnName === 'create_customer') {
                        const created = await this.customersAiService.createDraftFromAi(args);
                        return `Sugestão de cliente criada (draft): ${JSON.stringify(created)}`;
                    }
                    if (fnName === 'create_appointment') {
                        const created = await this.appointmentsAiService.createDraftFromAi(args);
                        return `Sugestão de agendamento criada (draft): ${JSON.stringify(created)}`;
                    }
                }
                catch (e) {
                    console.error('Failed to handle function_call', e);
                }
            }
            const content = response?.data?.choices?.[0]?.message?.content;
            if (typeof content === 'string' && content.length > 0)
                return content;
            console.error('AIChatService: unexpected OpenAI response', { body: response?.data });
            return 'Desculpe — não consegui gerar uma resposta agora.';
        }
        catch (err) {
            console.error('AIChatService.ask error', err);
            return 'Desculpe — ocorreu um erro ao gerar a resposta do assistente.';
        }
    }
};
exports.AIChatService = AIChatService;
exports.AIChatService = AIChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        service_service_1.ServiceService,
        appointments_service_1.AppointmentsService,
        customers_ai_service_1.CustomersAiService,
        appointments_ai_service_1.AppointmentsAiService,
        chat_service_1.ChatService])
], AIChatService);
//# sourceMappingURL=aichat.service.js.map