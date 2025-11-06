import { Test, TestingModule } from '@nestjs/testing';
import { ChartAIService } from './chartai.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from '../../appointments/entities/appointments.entity';
import { Customer } from '../../customers/entities/customers.entity';
import { Service } from '../../services/entities/service.entity';
import { Sale } from '../../sales/entities/sales.entity';
import { of } from 'rxjs';

describe('ChartAIService', () => {
  let service: ChartAIService;
  const httpMock = { post: jest.fn() } as any;
  const configMock = { 
    get: jest.fn().mockImplementation((key) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key';
      if (key === 'CHARTAI_TIMEOUT_MS') return '15000';
      return null;
    }) 
  } as any;

  const appointmentRepoMock = {
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'title' },
        { propertyName: 'appointmentDate' },
        { propertyName: 'startTime' },
      ],
    },
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { date: '2024-10-01', count: 5 },
        { date: '2024-10-02', count: 3 },
      ]),
    }),
  };

  const customerRepoMock = {
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'name' },
        { propertyName: 'email' },
        { propertyName: 'createdAt' },
      ],
    },
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { date: '2024-10-01', count: 2 },
        { date: '2024-10-15', count: 4 },
      ]),
    }),
  };

  const saleRepoMock = {
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'serviceName' },
        { propertyName: 'price' },
        { propertyName: 'saleDate' },
      ],
    },
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { date: '2024-10-01', sum: 150.5 },
        { date: '2024-10-02', sum: 200.0 },
      ]),
    }),
  };

  const serviceRepoMock = {
    metadata: {
      columns: [
        { propertyName: 'id' },
        { propertyName: 'name' },
        { propertyName: 'description' },
        { propertyName: 'price' },
      ],
    },
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartAIService,
        { provide: HttpService, useValue: httpMock },
        { provide: ConfigService, useValue: configMock },
        { provide: getRepositoryToken(Appointment), useValue: appointmentRepoMock },
        { provide: getRepositoryToken(Customer), useValue: customerRepoMock },
        { provide: getRepositoryToken(Sale), useValue: saleRepoMock },
        { provide: getRepositoryToken(Service), useValue: serviceRepoMock },
      ],
    }).compile();

    service = module.get<ChartAIService>(ChartAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve gerar gráfico com resposta da OpenAI', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              chartType: 'bar',
              dataQuery: {
                table: 'customers',
                fields: ['id'],
                filters: {}
              },
              dateRange: {
                field: 'createdAt',
                from: '2024-10-01',
                to: '2024-10-31'
              }
            })
          }
        }]
      }
    }));

    const result = await service.generateChart('gráfico de clientes em outubro 2024');
    
    expect(result).toBeDefined();
    expect(result.chartType).toBe('bar');
    expect(result.chartData).toBeDefined();
    expect(httpMock.post).toHaveBeenCalled();
  });

  it('deve usar heurística quando OpenAI não retorna JSON válido', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: 'Texto sem JSON válido'
          }
        }]
      }
    }));

    const result = await service.generateChart('vendas em outubro de 2024');
    
    expect(result).toBeDefined();
    expect(result.chartType).toBeDefined();
    expect(result.chartData).toBeDefined();
  });

  it('deve processar prompt com heurística para vendas', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: 'invalid'
          }
        }]
      }
    }));

    const result = await service.generateChart('total de vendas em setembro 2024');
    
    expect(result).toBeDefined();
    expect(result.chartData).toBeDefined();
  });

  it('deve processar prompt com heurística para agendamentos', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: 'invalid'
          }
        }]
      }
    }));

    const result = await service.generateChart('agendamentos em outubro 2024');
    
    expect(result).toBeDefined();
    expect(result.chartData).toBeDefined();
  });

  it('deve processar JSON com fenced code blocks', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: '```json\n{"chartType":"pie","dataQuery":{"table":"customers","fields":["id"],"filters":{}}}\n```'
          }
        }]
      }
    }));

    const result = await service.generateChart('gráfico de pizza de clientes');
    
    expect(result).toBeDefined();
    expect(result.chartType).toBe('pie');
    expect(result.chartData).toBeDefined();
  });

  it('deve usar heurística quando OpenAI falha', async () => {
    httpMock.post.mockReturnValueOnce(of({
      data: {
        choices: [{
          message: {
            content: 'invalid response'
          }
        }]
      }
    }));

    const result = await service.generateChart('vendas de outubro');
    
    expect(result).toBeDefined();
    expect(result.chartData).toBeDefined();
  });
});
