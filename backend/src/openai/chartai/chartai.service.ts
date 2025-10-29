import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointments.entity';
import { Customer } from '../../customers/entities/customers.entity';
import { Service } from '../../services/entities/service.entity';
import { Sale } from '../../sales/entities/sales.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChartAIService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Sale)
    private readonly saleRepo: Repository<Sale>,
  @InjectRepository(Service)
  private readonly serviceRepo: Repository<Service>,
  ) {}

  async generateChart(prompt: string) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

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

    // call OpenAI with a timeout to avoid hanging requests
    const timeoutMs = parseInt(this.configService.get('CHARTAI_TIMEOUT_MS') || '15000', 10);
    // If OPENAI_API_KEY is missing, skip the model call and rely on heuristics only.
    let chatContent: string | null = null;
    if (apiKey) {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: timeoutMs,
          },
        )
      );

      chatContent = response?.data?.choices?.[0]?.message?.content || null;
    }

    // tolerant JSON extraction (handles fences like ```json ... ``` or extra text)
    const extractJSONFromText = (text: string): any | null => {
      try {
        // try fenced json first
        const fenced = /```json\s*([\s\S]*?)```/.exec(text);
        if (fenced && fenced[1]) return JSON.parse(fenced[1]);

        // try any JSON object by finding the first { and matching braces
        const firstBrace = text.indexOf('{');
        if (firstBrace === -1) return null;
        let i = firstBrace;
        let depth = 0;
        for (; i < text.length; i++) {
          if (text[i] === '{') depth++;
          else if (text[i] === '}') {
            depth--;
            if (depth === 0) {
              const candidate = text.substring(firstBrace, i + 1);
              return JSON.parse(candidate);
            }
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    };

  let chartInstructions = extractJSONFromText(chatContent ?? '');

    // If extraction failed, attempt a simple heuristic parse from the prompt
    const parsePromptHeuristics = (text: string): any | null => {
      const t = text.toLowerCase();

      // simple chart type detection
      let chartType = 'bar';
      if (t.includes('pizza') || t.includes('pie')) chartType = 'pie';
      else if (t.includes('linha') || t.includes('line')) chartType = 'line';

  // table detection (inclui vendas)
  let table: 'customers' | 'appointments' | 'services' | 'sales' = 'customers';
  if (t.includes('cliente') || t.includes('clientes')) table = 'customers';
  else if (t.includes('agendamento') || t.includes('agendamentos') || t.includes('consulta')) table = 'appointments';
  else if (t.includes('serviço') || t.includes('servico') || t.includes('servicos')) table = 'services';
  else if (t.includes('venda') || t.includes('vendas') || t.includes('faturamento')) table = 'sales';

      // month/year detection (PT-BR)
      const months: Record<string, number> = {
        janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6,
        julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12
      };
      let month: number | null = null;
      for (const k of Object.keys(months)) {
        if (t.includes(k)) { month = months[k]; break; }
      }

      // year detection (e.g., 2024)
      const yearMatch = t.match(/20\d{2}/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();

      let dateRange: { field: string; from: string; to: string } | null = null;
      if (month) {
        const mm = month;
        const yyyy = year;
        // build YYYY-MM-DD strings for first and last day
        const first = new Date(yyyy, mm - 1, 1);
        const last = new Date(yyyy, mm, 0); // day 0 of next month = last day prev
        const pad = (n: number) => n.toString().padStart(2, '0');
        const from = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
        const to = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
        // default date field per table
        const field = table === 'appointments' ? 'appointmentDate' : 'createdAt';
        dateRange = { field, from, to };
      }

      // detect aggregate intent from prompt (heuristic)
      let aggregate: { op: 'count' | 'sum' | 'avg'; field?: string } | null = null;
      const contains = (words: string[]) => words.some(w => t.includes(w));
      if (contains(['ticket médio', 'ticket medio', 'média', 'media', 'avg', 'average'])) {
        aggregate = { op: 'avg', field: table === 'sales' ? 'price' : undefined };
      } else if (contains(['total', 'soma', 'faturamento', 'vendas totais', 'valor vendido', 'receita', 'total vendido'])) {
        aggregate = { op: 'sum', field: table === 'sales' ? 'price' : undefined };
      } else if (contains(['quantos', 'quantidade', 'número', 'numero', 'contagem', 'quantidade de'])) {
        aggregate = { op: 'count', field: 'id' };
      }

      // default to counting rows; request a single aggregated field 'count' if nothing else
      const dataQuery = {
        table,
        fields: ['id'],
        filters: {},
      };

      return { chartType, dataQuery, dateRange, aggregate };
    };

    if (!chartInstructions || !chartInstructions.dataQuery || !chartInstructions.chartType) {
      // try heuristics based on the original prompt (not the model's chatContent)
      const heur = parsePromptHeuristics(prompt);
      if (!heur) return { error: 'Não consegui extrair instruções de gráfico válidas do modelo.' };
      chartInstructions = heur;
    }

    // normalize table aliases and whitelist
    const table = String(chartInstructions.dataQuery.table || '').toLowerCase();
    const tableAliasMap: Record<string, 'appointments' | 'customers' | 'services' | 'sales'> = {
      appointments: 'appointments',
      appointment: 'appointments',
      customers: 'customers',
      customer: 'customers',
      services: 'services',
      service: 'services',
      products: 'services', // legacy wording -> services
      product: 'services',
      sales: 'sales',
      sale: 'sales',
      vendas: 'sales',
      venda: 'sales',
    };
    const mappedTable = tableAliasMap[table];
    if (!mappedTable) return { error: `Tabela solicitada não permitida: ${table}` };

    // get allowed columns dynamically from TypeORM metadata
    const repoMap: Record<string, Repository<any>> = {
      appointments: this.appointmentRepo,
      customers: this.customerRepo,
      services: this.serviceRepo,
      sales: this.saleRepo,
    };
    const repo = repoMap[mappedTable];
    const allowedFields = repo.metadata.columns.map((c) => c.propertyName);

    // requested fields: if omitted, select all allowed fields (but limit rows)
    const requestedFields = Array.isArray(chartInstructions.dataQuery.fields) && chartInstructions.dataQuery.fields.length > 0
      ? chartInstructions.dataQuery.fields.map((f: any) => String(f))
      : allowedFields;

    // intersect requested with allowed
    const selectFields = requestedFields.filter((f: string) => allowedFields.includes(f));
    if (selectFields.length === 0) return { error: 'Nenhum campo válido solicitado.' };

    // sanitize filters: only allow equality on allowed fields
    const rawFilters = chartInstructions.dataQuery.filters || {};
    const where: Record<string, any> = {};
    for (const k of Object.keys(rawFilters)) {
      if (allowedFields.includes(k)) where[k] = rawFilters[k];
    }

    // support optional dateRange produced by heuristics or by model
    const dateRange = (chartInstructions.dateRange && typeof chartInstructions.dateRange === 'object')
      ? chartInstructions.dateRange
      : null;

    // limit rows to avoid huge result sets
    const maxRows = parseInt(this.configService.get('CHARTAI_MAX_ROWS') || '500', 10);

  let chartData: Appointment[] | Customer[] | Service[] | Sale[] = [];
    try {
      // Determine aggregate requested: from model or heuristics
      const aggregate = (chartInstructions.aggregate && typeof chartInstructions.aggregate === 'object')
        ? chartInstructions.aggregate
        : null;

      // normalize aggregate op
      const aggOpRaw = String(aggregate?.op ?? '').toLowerCase();
      let aggOp: 'count' | 'sum' | 'avg' = 'count';
      if (aggOpRaw.includes('sum') || aggOpRaw.includes('total') || aggOpRaw.includes('soma') || aggOpRaw.includes('fatur')) aggOp = 'sum';
      else if (aggOpRaw.includes('avg') || aggOpRaw.includes('média') || aggOpRaw.includes('media') || aggOpRaw.includes('ticket')) aggOp = 'avg';

      // aggregate field (validate against allowedFields for sum/avg)
      let aggField: string | undefined = aggregate?.field;
      if ((aggOp === 'sum' || aggOp === 'avg') && (!aggField || !allowedFields.includes(aggField))) {
        // sensible default: sales.price for sales table
        if (mappedTable === 'sales' && allowedFields.includes('price')) aggField = 'price';
        else {
          // cannot perform SUM/AVG on missing field -> fallback to COUNT
          aggOp = 'count';
          aggField = undefined;
        }
      }

      // build WHERE clauses and params from sanitized `where` object
      const params: any[] = [];
      const conditions: string[] = [];
      for (const k of Object.keys(where)) {
        params.push(where[k]);
        conditions.push(`"${k}" = $${params.length}`);
      }

      if (dateRange && dateRange.field && allowedFields.includes(dateRange.field)) {
        // add date range params
        params.push(dateRange.from);
        params.push(dateRange.to);
        const tableName = repo.metadata.tableName;
        const fieldName = dateRange.field;

        // build aggregate expression
        let aggExpr = 'COUNT(*)';
  if (aggOp === 'sum') aggExpr = `SUM("${aggField}")`;
  else if (aggOp === 'avg') aggExpr = `AVG("${aggField}")`;

        // combine conditions
        const wherePrefix = conditions.length > 0 ? conditions.join(' AND ') + ' AND ' : '';
        const fromIdx = params.length - 1; // second-to-last pushed
        const toIdx = params.length;       // last pushed

  const sql = `SELECT to_char(date_trunc('day', "${fieldName}"), 'YYYY-MM-DD') as label, ${aggExpr}::numeric as value
                     FROM "${tableName}"
         WHERE ${wherePrefix}"${fieldName}" BETWEEN $${fromIdx} AND $${toIdx}
                     GROUP BY label
                     ORDER BY label`;

        try {
          const rows: Array<{ label: string; value: number }> = await repo.query(sql, params);
          chartData = rows.map(r => ({ label: r.label, value: Number(r.value) })) as any;
        } catch (e) {
          // fallback to simple find if aggregation fails
          chartData = await repo.find({
            select: selectFields as any,
            where,
            take: maxRows,
          });
        }
      } else if (aggregate) {
        // aggregate requested but no dateRange: return a single aggregated value (respecting filters)
        const tableName = repo.metadata.tableName;
        let aggExpr = 'COUNT(*)';
  if (aggOp === 'sum') aggExpr = `SUM("${aggField}")`;
  else if (aggOp === 'avg') aggExpr = `AVG("${aggField}")`;

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const sql = `SELECT ${aggExpr}::numeric as value FROM "${tableName}" ${whereClause}`;
        try {
          const rows: Array<{ value: number }> = await repo.query(sql, params);
          const v = rows && rows[0] ? Number(rows[0].value) : 0;
          chartData = [{ label: 'total', value: v }] as any;
        } catch (e) {
          chartData = await repo.find({
            select: selectFields as any,
            where,
            take: maxRows,
          });
        }
      } else {
        // no dateRange and no aggregate: return raw rows
        chartData = await repo.find({
          select: selectFields as any,
          where,
          take: maxRows,
        });
      }
    } catch (e) {
      console.error('ChartAIService: erro ao consultar DB', e);
      return { error: 'Erro ao buscar dados no banco para as instruções do modelo.' };
    }

    return {
      chartType: chartInstructions.chartType,
      chartData,
      meta: { table: mappedTable, selectedFields: selectFields, count: chartData.length },
    };
  }
}