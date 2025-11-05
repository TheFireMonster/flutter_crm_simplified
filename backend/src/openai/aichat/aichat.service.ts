import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ServiceService } from '../../services/service.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { CustomersAiService } from '../../customers/customers.ai.service';
import { AppointmentsAiService } from '../../appointments/appointments.ai.service';
import { ChatService } from '../../chat/chat.service';

@Injectable()
export class AIChatService {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly serviceService: ServiceService,
    private readonly appointmentsService: AppointmentsService,
    private readonly customersAiService: CustomersAiService,
    private readonly appointmentsAiService: AppointmentsAiService,
    private readonly chatService: ChatService,
  ) {}

  async ask(prompt: string, conversationId?: string, customerName?: string): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

  let services: any[] = [];
  let appointments: any[] = [];
  try {
    services = await this.serviceService.findAll();
  } catch (err) {
    console.error('AIChatService: failed to load services, continuing with empty list', err);
    services = [];
  }
  try {
    appointments = await this.appointmentsService.getAll();
  } catch (err) {
    console.error('AIChatService: failed to load appointments, continuing with empty list', err);
    appointments = [];
  }

  const productList = services.map(p => p.serviceName).join(', ');
    const appointmentList = appointments.map(a => `${a.title} em ${a.appointmentDate}`).join('; ');

    let systemPrompt =
      'Você é um assistente CRM útil. Sempre responda em português. ' +
      'Produtos/Serviços disponíveis: ' + productList + '. ' +
      'Use o ' + appointmentList + ' como referência dos dias e horários indisponíveis. Caso não encontre um agendamento criado em determinado dia ou horário, informe que está disponível.'
      'Ajude os clientes/pacientes a agendar consultas e resolver problemas.' +
      'Não crie agendamentos ou clientes fictícios, apenas sugira quando apropriado.'
      'Não presuma coisas sobre as quais você não tem certeza. Se não souber a resposta, diga que não sabe.';
    if (customerName) {
      systemPrompt += `\nNome do cliente: ${customerName}. Use isto para personalizar respostas quando apropriado.`;
    }
    const messages: Array<{ role: string; content: string }> = [];
    messages.push({ role: 'system', content: systemPrompt });

    if (conversationId) {
      try {
        const history = await this.chatService.getRecentMessages(conversationId, 20);
        for (const m of history) {
          const role = (m.sender === 'staff' || m.sender?.toLowerCase().includes('ai') ) ? 'assistant' : 'user';
          messages.push({ role, content: m.content });
        }
      } catch (e) {
        console.error('AIChatService: failed to load message history', e);
      }
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              ...messages,
              { role: 'user', content: prompt }
            ],
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        )
      );

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
        } catch (e) {
          console.error('Failed to handle function_call', e);
        }
      }

      const content = response?.data?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.length > 0) return content;
      console.error('AIChatService: unexpected OpenAI response', { body: response?.data });
      return 'Desculpe — não consegui gerar uma resposta agora.';
    } catch (err) {
      console.error('AIChatService.ask error', err);
      return 'Desculpe — ocorreu um erro ao gerar a resposta do assistente.';
    }
  }


}
