import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ServiceService } from '../../services/service.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { CustomersAiService } from '../../customers/customers.ai.service';
import { CustomersService } from '../../customers/customers.service';
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
    private readonly customersService: CustomersService,
    private readonly appointmentsAiService: AppointmentsAiService,
    private readonly chatService: ChatService,
  ) {}

  async ask(prompt: string, conversationId?: string, customerName?: string, customerId?: number): Promise<string> {
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
      'Use o ' + appointmentList + ' como referência dos dias e horários indisponíveis. Caso não encontre um agendamento criado em determinado dia ou horário, informe que está disponível. ' +
      'Ajude os clientes/pacientes a agendar consultas e resolver problemas. ' +
      'IMPORTANTE: No início da conversa, após cumprimentar o cliente, solicite educadamente o EMAIL e CPF dele para completar o cadastro. Diga algo como: "Para melhor atendê-lo, poderia me informar seu email e CPF?". ' +
      'Quando o cliente fornecer essas informações, USE IMEDIATAMENTE A FUNÇÃO update_customer_info para salvar no sistema. ' +
      'Quando o cliente quiser marcar um agendamento, USE A FUNÇÃO create_appointment para criar o agendamento. ' +
      'Quando o cliente fornecer informações adicionais (telefone, endereço, data de nascimento, etc.), USE A FUNÇÃO update_customer_info para atualizar o cadastro. ' +
      'Você TEM PERMISSÃO para criar agendamentos e atualizar informações de clientes usando as funções disponíveis. ' +
      'Não presuma coisas sobre as quais você não tem certeza. Se não souber a resposta, diga que não sabe.';
    if (customerName) {
      systemPrompt += `\nNome do cliente: ${customerName}. Use isto para personalizar respostas quando apropriado.`;
    }
    if (customerId) {
      systemPrompt += `\nID do cliente atual: ${customerId}. Use este ID quando precisar criar agendamentos ou atualizar informações do cliente.`;
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
      const functions = [
        {
          name: 'update_customer_info',
          description: 'Atualiza ou complementa as informações de um cliente existente (email, telefone, CPF, endereço, etc.)',
          parameters: {
            type: 'object',
            properties: {
              customerId: {
                type: 'integer',
                description: 'ID do cliente a ser atualizado'
              },
              email: {
                type: 'string',
                description: 'Email do cliente'
              },
              cpf: {
                type: 'string',
                description: 'CPF do cliente (opcional)'
              },
              phone: {
                type: 'string',
                description: 'Telefone do cliente (opcional)'
              },
              address: {
                type: 'string',
                description: 'Endereço do cliente (opcional)'
              },
              dateOfBirth: {
                type: 'string',
                description: 'Data de nascimento (formato DD/MM/YYYY)'
              },
              state: {
                type: 'string',
                description: 'Estado (UF)'
              },
              cep: {
                type: 'string',
                description: 'CEP do cliente'
              }
            },
            required: ['customerId']
          }
        },
        {
          name: 'create_appointment',
          description: 'Cria um novo agendamento para o cliente',
          parameters: {
            type: 'object',
            properties: {
              customerId: {
                type: 'integer',
                description: 'ID do cliente (use o ID do cliente atual se disponível)'
              },
              serviceName: {
                type: 'string',
                description: 'Nome do serviço a ser agendado'
              },
              startAt: {
                type: 'string',
                description: 'Data e hora de início no formato ISO-8601 (ex: 2025-11-11T08:00:00)'
              },
              durationMinutes: {
                type: 'integer',
                description: 'Duração em minutos (padrão: 60)'
              },
              notes: {
                type: 'string',
                description: 'Notas ou observações sobre o agendamento'
              }
            },
            required: ['customerId', 'startAt']
          }
        }
      ];

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: messages,
            functions: functions,
            function_call: 'auto',
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
          
          if (fnName === 'update_customer_info') {
            const { customerId, ...updateData } = args;
            await this.customersAiService.updateFromAi(customerId, updateData);
            return `Informações do cliente atualizadas com sucesso!`;
          }
          
          if (fnName === 'create_appointment') {
            await this.appointmentsAiService.createFromAi(args);
            return `Agendamento criado com sucesso!`;
          }
        } catch (e) {
          console.error('Failed to handle function_call', e);
          return `Desculpe, ocorreu um erro ao processar sua solicitação: ${e.message}`;
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
