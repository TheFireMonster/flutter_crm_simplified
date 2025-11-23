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
    const appointmentList = appointments.map(a => `${a.title} em ${a.appointmentDate} às ${a.startTime}`).join('; ');

    let systemPrompt =
      'Você é um assistente CRM útil. Sempre responda em português. ' +
      'Produtos/Serviços disponíveis: ' + productList + '. ' +
      'HORÁRIOS JÁ OCUPADOS: ' + (appointmentList || 'Nenhum') + '. ' +
      'Considere apenas os agendamentos listados como horários ocupados. Não invente indisponibilidades. Se o horário não estiver na lista, está disponível. ' +
      'Horários de funcionamento: segunda a sexta, das 8h às 18h. Não atendemos em feriados. Considere apenas esses horários como disponíveis. ' +
      'Ajude os clientes/pacientes a agendar consultas e resolver problemas. ' +
      'IMPORTANTE: No início da conversa, após cumprimentar o cliente, solicite educadamente o EMAIL e CPF dele para completar o cadastro. ' +
      'Quando o cliente fornecer essas informações, USE IMEDIATAMENTE A FUNÇÃO update_customer_info para salvar no sistema. ' +
      'APÓS atualizar as informações do cliente com sucesso, SEMPRE pergunte se ele deseja agendar uma consulta. ' +
      'Quando o cliente quiser marcar um agendamento, pergunte: 1) Qual dia deseja? 2) Qual horário prefere? ' +
      'NÃO pergunte sobre serviço ou duração - sempre use o serviço padrão com 60 minutos de duração. ' +
      'FORMATO DE DATA: Quando o cliente disser "amanhã", "próxima segunda", etc, calcule a data correta no formato ISO (YYYY-MM-DDTHH:mm:ss). ' +
      'IMPORTANTE: Use SEMPRE o formato ISO-8601 completo para datas, exemplo: 2025-11-25T14:00:00 (não use apenas a data). ' +
      'Quando o cliente fornecer informações adicionais (telefone, endereço, data de nascimento, etc.), USE A FUNÇÃO update_customer_info para atualizar o cadastro. ' +
      'Você TEM PERMISSÃO para criar agendamentos e atualizar informações de clientes usando as funções disponíveis. ' +
      'CRÍTICO: Sempre confirme com o cliente antes de criar o agendamento dizendo "Perfeito! Vou agendar para [dia] às [hora]. Confirma?"';
      
    if (customerName) {
      systemPrompt += `\nNome do cliente: ${customerName}. Use isto para personalizar respostas.`;
    }
    if (customerId) {
      systemPrompt += `\nID do cliente atual: ${customerId}. Use este ID quando precisar criar agendamentos ou atualizar informações.`;
    }

    const messages: Array<{ role: string; content: string }> = [];
    messages.push({ role: 'system', content: systemPrompt });

    if (conversationId) {
      try {
        const history = await this.chatService.getRecentMessages(conversationId, 20);
        for (const m of history) {
          const role = (m.sender === 'staff' || m.sender?.toLowerCase().includes('ai')) ? 'assistant' : 'user';
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
              email: { type: 'string', description: 'Email do cliente' },
              cpf: { type: 'string', description: 'CPF do cliente (opcional)' },
              phone: { type: 'string', description: 'Telefone do cliente (opcional)' },
              address: { type: 'string', description: 'Endereço do cliente (opcional)' },
              dateOfBirth: { type: 'string', description: 'Data de nascimento (formato DD/MM/YYYY)' },
              state: { type: 'string', description: 'Estado (UF)' },
              cep: { type: 'string', description: 'CEP do cliente' }
            },
            required: ['customerId']
          }
        },
        {
          name: 'create_appointment',
          description: 'Cria um novo agendamento para o cliente. Use SEMPRE data e hora completas no formato ISO-8601 (exemplo: 2025-11-25T14:00:00)',
          parameters: {
            type: 'object',
            properties: {
              customerId: {
                type: 'integer',
                description: 'ID do cliente (use o ID do cliente atual se disponível)'
              },
              startAt: {
                type: 'string',
                description: 'Data e hora de início no formato ISO-8601 COMPLETO (ex: 2025-11-25T14:00:00). SEMPRE inclua hora, minuto e segundo.'
              },
              durationMinutes: {
                type: 'integer',
                description: 'Duração em minutos - use sempre 60 se não especificado'
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

      console.log('🤖 Chamando OpenAI com histórico de', messages.length, 'mensagens');

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
        console.log('🔧 IA chamou função:', message.function_call.name);
        console.log('📋 Argumentos:', message.function_call.arguments);
        
        try {
          const fnName = message.function_call.name;
          const args = JSON.parse(message.function_call.arguments || '{}');

          if (fnName === 'update_customer_info') {
            const { customerId, ...updateData } = args;
            console.log('📝 Atualizando cliente', customerId, 'com:', updateData);
            const result = await this.customersAiService.updateFromAi(customerId, updateData);
            if (result && result.success) {
              return `Pronto! Suas informações foram atualizadas com sucesso. Posso te ajudar a agendar uma consulta ou tirar alguma dúvida?`;
            } else {
              return `Ops! Não consegui atualizar seus dados agora. Você pode conferir as informações e tentar novamente?`;
            }
          }

          if (fnName === 'create_appointment') {
            console.log('📅 Tentando criar agendamento com args:', JSON.stringify(args, null, 2));
            
            if (!args.customerId) {
              console.error('❌ customerId não fornecido!');
              return 'Desculpe, preciso do seu cadastro completo antes de agendar. Pode me informar seu email e CPF?';
            }

            if (!args.startAt || !args.startAt.includes('T')) {
              console.error('❌ startAt em formato incorreto:', args.startAt);
              return 'Desculpe, houve um erro ao processar a data. Pode me informar o dia e horário que deseja agendar novamente?';
            }

            args.durationMinutes = 60;
            args.serviceName = 'Consulta';

            console.log('✅ Chamando appointmentsAiService.createFromAi com:', args);

            try {
              const result = await this.appointmentsAiService.createFromAi(args);
              console.log('📊 Resultado do agendamento:', result);
              
              if (result && (result.id || result[0]?.id)) {
                const appointmentId = result.id || result[0]?.id;
                console.log('✅ Agendamento criado com ID:', appointmentId);
                return `Pronto! Sua consulta está agendada. Se precisar de mais alguma coisa, estou à disposição!`;
              } else {
                console.error('❌ Resultado do agendamento não contém ID:', result);
                return `Não consegui agendar nesse horário. Que tal escolher outro horário? Estou aqui para ajudar!`;
              }
            } catch (error) {
              console.error('❌ Erro ao criar agendamento:', error);
              return `Ops! Tive um problema ao criar o agendamento. Pode tentar novamente com outro horário?`;
            }
          }
        } catch (e) {
          console.error('❌ Failed to handle function_call', e);
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