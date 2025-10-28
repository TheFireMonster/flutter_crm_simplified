import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointments.entity';
import { Customer } from '../../customers/entities/customers.entity';
import { Service } from '../../services/entities/service.entity';
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
  @InjectRepository(Service)
  private readonly serviceRepo: Repository<Service>,
  ) {}

  async generateChart(prompt: string) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
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

    // call OpenAI with a timeout to avoid hanging requests
    const timeoutMs = parseInt(this.configService.get('CHARTAI_TIMEOUT_MS') || '15000', 10);
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

    const chatContent = response?.data?.choices?.[0]?.message?.content;
    if (!chatContent || typeof chatContent !== 'string') {
      return { error: 'Resposta do modelo vazia ou inválida.' };
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

    const chartInstructions = extractJSONFromText(chatContent);
    if (!chartInstructions || !chartInstructions.dataQuery || !chartInstructions.chartType) {
      return { error: 'Não consegui extrair instruções de gráfico válidas do modelo.' };
    }

    // normalize table aliases and whitelist
    const table = String(chartInstructions.dataQuery.table || '').toLowerCase();
    const tableAliasMap: Record<string, 'appointments' | 'customers' | 'services'> = {
      appointments: 'appointments',
      appointment: 'appointments',
      customers: 'customers',
      customer: 'customers',
      services: 'services',
      service: 'services',
      products: 'services', // legacy wording -> services
      product: 'services',
    };
    const mappedTable = tableAliasMap[table];
    if (!mappedTable) return { error: `Tabela solicitada não permitida: ${table}` };

    // get allowed columns dynamically from TypeORM metadata
    const repoMap: Record<string, Repository<any>> = {
      appointments: this.appointmentRepo,
      customers: this.customerRepo,
      services: this.serviceRepo,
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

    // limit rows to avoid huge result sets
    const maxRows = parseInt(this.configService.get('CHARTAI_MAX_ROWS') || '500', 10);

    let chartData: Appointment[] | Customer[] | Service[] = [];
    try {
      chartData = await repo.find({
        select: selectFields as any,
        where,
        take: maxRows,
      });
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