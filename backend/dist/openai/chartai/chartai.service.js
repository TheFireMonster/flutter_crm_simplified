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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartAIService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointments_entity_1 = require("../../appointments/entities/appointments.entity");
const customers_entity_1 = require("../../customers/entities/customers.entity");
const service_entity_1 = require("../../services/entities/service.entity");
const rxjs_1 = require("rxjs");
let ChartAIService = class ChartAIService {
    httpService;
    configService;
    appointmentRepo;
    customerRepo;
    serviceRepo;
    constructor(httpService, configService, appointmentRepo, customerRepo, serviceRepo) {
        this.httpService = httpService;
        this.configService = configService;
        this.appointmentRepo = appointmentRepo;
        this.customerRepo = customerRepo;
        this.serviceRepo = serviceRepo;
    }
    async generateChart(prompt) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            return { error: 'OPENAI_API_KEY não configurada no servidor.' };
        }
        const systemPrompt = `
      Você é um assistente de relatórios. Sempre responda em português.
      Quando receber um pedido de gráfico, responda com um JSON contendo:
      {
        "chartType": "bar|pie|line|etc",
        "dataQuery": {
          "table": "appointments|customers|services",
          "fields": ["field1", "field2"],
          "filters": {"field": "value"}
        }
      }
      Retorne APENAS o JSON solicitado, sem explicações. Não gere dados fictícios, apenas a estrutura do que precisa buscar.
    `;
        const timeoutMs = parseInt(this.configService.get('CHARTAI_TIMEOUT_MS') || '15000', 10);
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
            timeout: timeoutMs,
        }));
        const chatContent = response?.data?.choices?.[0]?.message?.content;
        if (!chatContent || typeof chatContent !== 'string') {
            return { error: 'Resposta do modelo vazia ou inválida.' };
        }
        const extractJSONFromText = (text) => {
            try {
                const fenced = /```json\s*([\s\S]*?)```/.exec(text);
                if (fenced && fenced[1])
                    return JSON.parse(fenced[1]);
                const firstBrace = text.indexOf('{');
                if (firstBrace === -1)
                    return null;
                let i = firstBrace;
                let depth = 0;
                for (; i < text.length; i++) {
                    if (text[i] === '{')
                        depth++;
                    else if (text[i] === '}') {
                        depth--;
                        if (depth === 0) {
                            const candidate = text.substring(firstBrace, i + 1);
                            return JSON.parse(candidate);
                        }
                    }
                }
                return null;
            }
            catch (e) {
                return null;
            }
        };
        const chartInstructions = extractJSONFromText(chatContent);
        if (!chartInstructions || !chartInstructions.dataQuery || !chartInstructions.chartType) {
            return { error: 'Não consegui extrair instruções de gráfico válidas do modelo.' };
        }
        const table = String(chartInstructions.dataQuery.table || '').toLowerCase();
        const tableAliasMap = {
            appointments: 'appointments',
            appointment: 'appointments',
            customers: 'customers',
            customer: 'customers',
            services: 'services',
            service: 'services',
            products: 'services',
            product: 'services',
        };
        const mappedTable = tableAliasMap[table];
        if (!mappedTable)
            return { error: `Tabela solicitada não permitida: ${table}` };
        const repoMap = {
            appointments: this.appointmentRepo,
            customers: this.customerRepo,
            services: this.serviceRepo,
        };
        const repo = repoMap[mappedTable];
        const allowedFields = repo.metadata.columns.map((c) => c.propertyName);
        const requestedFields = Array.isArray(chartInstructions.dataQuery.fields) && chartInstructions.dataQuery.fields.length > 0
            ? chartInstructions.dataQuery.fields.map((f) => String(f))
            : allowedFields;
        const selectFields = requestedFields.filter((f) => allowedFields.includes(f));
        if (selectFields.length === 0)
            return { error: 'Nenhum campo válido solicitado.' };
        const rawFilters = chartInstructions.dataQuery.filters || {};
        const where = {};
        for (const k of Object.keys(rawFilters)) {
            if (allowedFields.includes(k))
                where[k] = rawFilters[k];
        }
        const maxRows = parseInt(this.configService.get('CHARTAI_MAX_ROWS') || '500', 10);
        let chartData = [];
        try {
            chartData = await repo.find({
                select: selectFields,
                where,
                take: maxRows,
            });
        }
        catch (e) {
            console.error('ChartAIService: erro ao consultar DB', e);
            return { error: 'Erro ao buscar dados no banco para as instruções do modelo.' };
        }
        return {
            chartType: chartInstructions.chartType,
            chartData,
            meta: { table: mappedTable, selectedFields: selectFields, count: chartData.length },
        };
    }
};
exports.ChartAIService = ChartAIService;
exports.ChartAIService = ChartAIService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(appointments_entity_1.Appointment)),
    __param(3, (0, typeorm_1.InjectRepository)(customers_entity_1.Customer)),
    __param(4, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChartAIService);
//# sourceMappingURL=chartai.service.js.map