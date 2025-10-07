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
exports.ChatGptService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const products_services_service_1 = require("../products_services/products_services.service");
const appointments_service_1 = require("../appointments/appointments.service");
let ChatGptService = class ChatGptService {
    httpService;
    configService;
    productsServicesService;
    appointmentsService;
    constructor(httpService, configService, productsServicesService, appointmentsService) {
        this.httpService = httpService;
        this.configService = configService;
        this.productsServicesService = productsServicesService;
        this.appointmentsService = appointmentsService;
    }
    async ask(prompt) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        const products = await this.productsServicesService.findAll();
        const appointments = await this.appointmentsService.getAll();
        const productList = products.map(p => p.name).join(', ');
        const appointmentList = appointments.map(a => `${a.title} em ${a.appointmentDate}`).join('; ');
        const systemPrompt = 'Você é um assistente CRM útil. Sempre responda em português. ' +
            'Produtos/Serviços disponíveis: ' + productList + '. ' +
            'Agendamentos: ' + appointmentList + '. ' +
            'Ajude os clientes/pacientes a agendar consultas e resolver problemas.';
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }));
        return response.data.choices[0].message.content;
    }
};
exports.ChatGptService = ChatGptService;
exports.ChatGptService = ChatGptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        products_services_service_1.ProductsServicesService,
        appointments_service_1.AppointmentsService])
], ChatGptService);
//# sourceMappingURL=chatgpt.service.js.map