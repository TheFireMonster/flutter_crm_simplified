import { Test, TestingModule } from '@nestjs/testing';
import { AIChatService } from './aichat.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductsServicesService } from '../../products_services/products_services.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { of } from 'rxjs';

describe('ChatGptService', () => {
  let service: AIChatService;
  let httpService: HttpService;
  let configService: ConfigService;
  let productsServicesService: ProductsServicesService;
  let appointmentsService: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIChatService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ data: { choices: [{ message: { content: 'mocked response' } }] } }))
          }
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-api-key') }
        },
        {
          provide: ProductsServicesService,
          useValue: { findAll: jest.fn().mockResolvedValue([{ name: 'Produto1' }, { name: 'Produto2' }]) }
        },
        {
          provide: AppointmentsService,
          useValue: { getAll: jest.fn().mockResolvedValue([{ title: 'Consulta', appointmentDate: '2025-10-10' }]) }
        }
      ],
    }).compile();

    service = module.get<AIChatService>(AIChatService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    productsServicesService = module.get<ProductsServicesService>(ProductsServicesService);
    appointmentsService = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call OpenAI API and return a response', async () => {
    const result = await service.ask('Olá, assistente!');
    expect(result).toBe('mocked response');
  });
});
