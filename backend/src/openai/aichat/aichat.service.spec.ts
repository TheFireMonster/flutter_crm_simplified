import { Test, TestingModule } from '@nestjs/testing';
import { AIChatService } from './aichat.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ServiceService } from '../../services/service.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { CustomersAiService } from '../../customers/customers.ai.service';
import { CustomersService } from '../../customers/customers.service';
import { AppointmentsAiService } from '../../appointments/appointments.ai.service';
import { of, Observable } from 'rxjs';
import { ChatService } from '../../chat/chat.service';

describe('AIChatService', () => {
  let service: AIChatService;
  const httpMock = { post: jest.fn() } as any;
  const configMock = { get: jest.fn().mockImplementation((k) => (k === 'MOCK_AI' ? 'true' : 'test-api-key')) } as any;
  const serviceServiceMock = { findAll: jest.fn().mockResolvedValue([{ serviceName: 'Consulta' }]) } as any;
  const appointmentsServiceMock = { getAll: jest.fn().mockResolvedValue([{ title: 'Consulta', appointmentDate: '2025-10-10' }]) } as any;
  const customersAiMock = { createFromAi: jest.fn() } as any;
  const customersServiceMock = { findAll: jest.fn().mockResolvedValue([{ name: 'Cliente Teste' }]) } as any;
  const appointmentsAiMock = { createFromAi: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIChatService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: AppointmentsService, useValue: appointmentsServiceMock },
        { provide: CustomersAiService, useValue: customersAiMock },
        { provide: CustomersService, useValue: customersServiceMock },
        { provide: AppointmentsAiService, useValue: appointmentsAiMock },
    { provide: ChatService, useValue: { getRecentMessages: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<AIChatService>(AIChatService);
  });

  afterEach(() => jest.clearAllMocks());

  it('deve chamar a API OpenAI e retornar a resposta de ask()', async () => {
    (httpMock.post as jest.Mock).mockReturnValueOnce(of({ data: { choices: [{ message: { content: 'mocked response' } }] } }));
    const result = await service.ask('Olá, assistente!');
    expect(result).toBe('mocked response');
    expect(httpMock.post).toHaveBeenCalled();
  });

  it('deve lidar com latência da OpenAI e retornar a resposta atrasada', async () => {
    (httpMock.post as jest.Mock).mockImplementation(() => new Observable((subscriber) => {
      setTimeout(() => {
        subscriber.next({ data: { choices: [{ message: { content: 'delayed response' } }] } });
        subscriber.complete();
      }, 50);
    }));

    const askPromise = service.ask('Teste de latência');
    const result = await askPromise;
    expect(result).toBe('delayed response');
  }, 10000);

  it('deve tratar erros HTTP 429 da OpenAI de forma adequada', async () => {
    (httpMock.post as jest.Mock).mockImplementation(() => new Observable((subscriber) => {
      subscriber.error({ response: { status: 429, data: 'rate limit' } });
    }));

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await service.ask('Teste 429');
    expect(result).toBe('Desculpe — ocorreu um erro ao gerar a resposta do assistente.');
    expect(httpMock.post).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('AIChatService.ask error', expect.objectContaining({ response: expect.objectContaining({ status: 429 }) }));
    errorSpy.mockRestore();
  });
});
