import { Test, TestingModule } from '@nestjs/testing';
import { AIChatService } from './aichat.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ServiceService } from '../../services/service.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { CustomersAiService } from '../../customers/customers.ai.service';
import { AppointmentsAiService } from '../../appointments/appointments.ai.service';
import { of } from 'rxjs';

describe('AIChatService', () => {
  let service: AIChatService;
  const httpMock = { post: jest.fn() } as any;
  const configMock = { get: jest.fn().mockImplementation((k) => (k === 'MOCK_AI' ? 'true' : 'test-api-key')) } as any;
  const serviceServiceMock = { findAll: jest.fn().mockResolvedValue([{ serviceName: 'Consulta' }]) } as any;
  const appointmentsServiceMock = { getAll: jest.fn().mockResolvedValue([{ title: 'Consulta', appointmentDate: '2025-10-10' }]) } as any;
  const customersAiMock = { createDraftFromAi: jest.fn() } as any;
  const appointmentsAiMock = { createDraftFromAi: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIChatService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: AppointmentsService, useValue: appointmentsServiceMock },
        { provide: CustomersAiService, useValue: customersAiMock },
        { provide: AppointmentsAiService, useValue: appointmentsAiMock },
      ],
    }).compile();

    service = module.get<AIChatService>(AIChatService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call OpenAI API and return a response for ask()', async () => {
    (httpMock.post as jest.Mock).mockReturnValueOnce(of({ data: { choices: [{ message: { content: 'mocked response' } }] } }));
    const result = await service.ask('Olá, assistente!');
    expect(result).toBe('mocked response');
    expect(httpMock.post).toHaveBeenCalled();
  });
});
