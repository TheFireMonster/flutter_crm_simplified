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
const sales_entity_1 = require("../../sales/entities/sales.entity");
const rxjs_1 = require("rxjs");
let ChartAIService = class ChartAIService {
    httpService;
    configService;
    appointmentRepo;
    customerRepo;
    saleRepo;
    serviceRepo;
    constructor(httpService, configService, appointmentRepo, customerRepo, saleRepo, serviceRepo) {
        this.httpService = httpService;
        this.configService = configService;
        this.appointmentRepo = appointmentRepo;
        this.customerRepo = customerRepo;
        this.saleRepo = saleRepo;
        this.serviceRepo = serviceRepo;
    }
    async generateChart(prompt) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        const systemPrompt = `
      Você é um assistente de relatórios em português. Sempre responda APENAS com um JSON válido (sem comentários ou explicações) seguindo o formato abaixo.
      Quando receber um pedido de gráfico, responda com um JSON contendo exatamente:
      {
        "chartType": "bar|pie|line|etc",
        "dataQuery": {
          "table": "appointments|customers|services|sales",
          "fields": ["field1", "field2"],
          "filters": {"field": "value"}
        }
      }

      Forneça apenas a estrutura necessária para que o backend busque os dados reais. NÃO invente dados, NÃO retorne explicações. Se quiser incluir um intervalo de datas, adicione um campo opcional "dateRange": {"field": "createdAt|saleDate|appointmentDate", "from": "YYYY-MM-DD", "to": "YYYY-MM-DD"}.

      Exemplos (responda exatamente no mesmo formato JSON quando semelhante):

      1) Prompt: "faça um gráfico de barras com quantos clientes novos tivemos em outubro de 2024"
      Resposta esperada:
      {
        "chartType": "bar",
        "dataQuery": {
          "table": "customers",
          "fields": ["id"],
          "filters": {}
        },
        "dateRange": {"field": "createdAt", "from": "2024-10-01", "to": "2024-10-31"}
      }

      2) Prompt: "mostre vendas totais por dia para setembro 2025"
      Resposta esperada:
      {
        "chartType": "bar",
        "dataQuery": {
          "table": "sales",
          "fields": ["id"],
          "filters": {}
        },
        "dateRange": {"field": "saleDate", "from": "2025-09-01", "to": "2025-09-30"}
      }

      3) Prompt: "quantos agendamentos tivemos por dia nesta semana"
      Resposta esperada (use a dataRange com appointmentDate):
      {
        "chartType": "line",
        "dataQuery": {
          "table": "appointments",
          "fields": ["id"],
          "filters": {}
        },
        "dateRange": {"field": "appointmentDate", "from": "2025-10-20", "to": "2025-10-26"}
      }

      Se o usuário pedir métricas específicas (ex.: total vendido, ticket médio), retorne a mesma estrutura e deixe que o backend agregue por COUNT/SUM conforme os campos solicitados.
    `;
        const timeoutMs = parseInt(this.configService.get('CHARTAI_TIMEOUT_MS') || '15000', 10);
        let chatContent = null;
        if (apiKey) {
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
            chatContent = response?.data?.choices?.[0]?.message?.content || null;
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
        let chartInstructions = extractJSONFromText(chatContent ?? '');
        const parsePromptHeuristics = (text) => {
            const t = text.toLowerCase();
            let chartType = 'bar';
            if (t.includes('pizza') || t.includes('pie'))
                chartType = 'pie';
            else if (t.includes('linha') || t.includes('line'))
                chartType = 'line';
            let table = 'customers';
            if (t.includes('cliente') || t.includes('clientes'))
                table = 'customers';
            else if (t.includes('agendamento') || t.includes('agendamentos') || t.includes('consulta'))
                table = 'appointments';
            else if (t.includes('serviço') || t.includes('servico') || t.includes('servicos'))
                table = 'services';
            else if (t.includes('venda') || t.includes('vendas') || t.includes('faturamento'))
                table = 'sales';
            const months = {
                janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6,
                julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12
            };
            let month = null;
            for (const k of Object.keys(months)) {
                if (t.includes(k)) {
                    month = months[k];
                    break;
                }
            }
            const yearMatch = t.match(/20\d{2}/);
            const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
            let dateRange = null;
            if (month) {
                const mm = month;
                const yyyy = year;
                const first = new Date(yyyy, mm - 1, 1);
                const last = new Date(yyyy, mm, 0);
                const pad = (n) => n.toString().padStart(2, '0');
                const from = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
                const to = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
                const field = table === 'appointments' ? 'appointmentDate' : 'createdAt';
                dateRange = { field, from, to };
            }
            let aggregate = null;
            const contains = (words) => words.some(w => t.includes(w));
            if (contains(['ticket médio', 'ticket medio', 'média', 'media', 'avg', 'average'])) {
                aggregate = { op: 'avg', field: table === 'sales' ? 'price' : undefined };
            }
            else if (contains(['total', 'soma', 'faturamento', 'vendas totais', 'valor vendido', 'receita', 'total vendido'])) {
                aggregate = { op: 'sum', field: table === 'sales' ? 'price' : undefined };
            }
            else if (contains(['quantos', 'quantidade', 'número', 'numero', 'contagem', 'quantidade de'])) {
                aggregate = { op: 'count', field: 'id' };
            }
            const dataQuery = {
                table,
                fields: ['id'],
                filters: {},
            };
            return { chartType, dataQuery, dateRange, aggregate };
        };
        if (!chartInstructions || !chartInstructions.dataQuery || !chartInstructions.chartType) {
            const heur = parsePromptHeuristics(prompt);
            if (!heur)
                return { error: 'Não consegui extrair instruções de gráfico válidas do modelo.' };
            chartInstructions = heur;
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
            sales: 'sales',
            sale: 'sales',
            vendas: 'sales',
            venda: 'sales',
        };
        const mappedTable = tableAliasMap[table];
        if (!mappedTable)
            return { error: `Tabela solicitada não permitida: ${table}` };
        const repoMap = {
            appointments: this.appointmentRepo,
            customers: this.customerRepo,
            services: this.serviceRepo,
            sales: this.saleRepo,
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
        const dateRange = (chartInstructions.dateRange && typeof chartInstructions.dateRange === 'object')
            ? chartInstructions.dateRange
            : null;
        const maxRows = parseInt(this.configService.get('CHARTAI_MAX_ROWS') || '500', 10);
        let chartData = [];
        try {
            const aggregate = (chartInstructions.aggregate && typeof chartInstructions.aggregate === 'object')
                ? chartInstructions.aggregate
                : null;
            const aggOpRaw = String(aggregate?.op ?? '').toLowerCase();
            let aggOp = 'count';
            if (aggOpRaw.includes('sum') || aggOpRaw.includes('total') || aggOpRaw.includes('soma') || aggOpRaw.includes('fatur'))
                aggOp = 'sum';
            else if (aggOpRaw.includes('avg') || aggOpRaw.includes('média') || aggOpRaw.includes('media') || aggOpRaw.includes('ticket'))
                aggOp = 'avg';
            let aggField = aggregate?.field;
            if ((aggOp === 'sum' || aggOp === 'avg') && (!aggField || !allowedFields.includes(aggField))) {
                if (mappedTable === 'sales' && allowedFields.includes('price'))
                    aggField = 'price';
                else {
                    aggOp = 'count';
                    aggField = undefined;
                }
            }
            const params = [];
            const conditions = [];
            for (const k of Object.keys(where)) {
                params.push(where[k]);
                conditions.push(`"${k}" = $${params.length}`);
            }
            if (dateRange && dateRange.field && allowedFields.includes(dateRange.field)) {
                params.push(dateRange.from);
                params.push(dateRange.to);
                const tableName = repo.metadata.tableName;
                const fieldName = dateRange.field;
                let aggExpr = 'COUNT(*)';
                if (aggOp === 'sum')
                    aggExpr = `SUM("${aggField}")`;
                else if (aggOp === 'avg')
                    aggExpr = `AVG("${aggField}")`;
                const wherePrefix = conditions.length > 0 ? conditions.join(' AND ') + ' AND ' : '';
                const fromIdx = params.length - 1;
                const toIdx = params.length;
                const sql = `SELECT to_char(date_trunc('day', "${fieldName}"), 'YYYY-MM-DD') as label, ${aggExpr}::numeric as value
                     FROM "${tableName}"
         WHERE ${wherePrefix}"${fieldName}" BETWEEN $${fromIdx} AND $${toIdx}
                     GROUP BY label
                     ORDER BY label`;
                try {
                    const rows = await repo.query(sql, params);
                    chartData = rows.map(r => ({ label: r.label, value: Number(r.value) }));
                }
                catch (e) {
                    chartData = await repo.find({
                        select: selectFields,
                        where,
                        take: maxRows,
                    });
                }
            }
            else if (aggregate) {
                const tableName = repo.metadata.tableName;
                let aggExpr = 'COUNT(*)';
                if (aggOp === 'sum')
                    aggExpr = `SUM("${aggField}")`;
                else if (aggOp === 'avg')
                    aggExpr = `AVG("${aggField}")`;
                const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
                const sql = `SELECT ${aggExpr}::numeric as value FROM "${tableName}" ${whereClause}`;
                try {
                    const rows = await repo.query(sql, params);
                    const v = rows && rows[0] ? Number(rows[0].value) : 0;
                    chartData = [{ label: 'total', value: v }];
                }
                catch (e) {
                    chartData = await repo.find({
                        select: selectFields,
                        where,
                        take: maxRows,
                    });
                }
            }
            else {
                chartData = await repo.find({
                    select: selectFields,
                    where,
                    take: maxRows,
                });
            }
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
    __param(4, (0, typeorm_1.InjectRepository)(sales_entity_1.Sale)),
    __param(5, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChartAIService);
//# sourceMappingURL=chartai.service.js.map