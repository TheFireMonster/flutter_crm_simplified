import { Test, TestingModule } from '@nestjs/testing';
import { ChartAIController } from './chartai.controller';
import { ChartAIService } from './chartai.service';

describe('ChartAIController', () => {
  let controller: ChartAIController;
  let service: ChartAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChartAIController],
      providers: [
        {
          provide: ChartAIService,
          useValue: {
            generateChart: jest.fn().mockResolvedValue({
              chartType: 'bar',
              chartData: [
                { date: '2024-10-01', count: 5 },
                { date: '2024-10-02', count: 3 },
              ],
              meta: {
                table: 'customers',
                selectedFields: [],
                count: 8,
              },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ChartAIController>(ChartAIController);
    service = module.get<ChartAIService>(ChartAIService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve gerar gráfico através do endpoint', async () => {
    const dto = { prompt: 'gráfico de vendas em outubro' };
    const result = await controller.generateChart(dto);
    
    expect(result).toBeDefined();
    expect(result.chartType).toBe('bar');
    expect(result.chartData).toBeDefined();
    expect(service.generateChart).toHaveBeenCalledWith('gráfico de vendas em outubro');
  });

  it('deve retornar dados do serviço', async () => {
    const dto = { prompt: 'clientes novos' };
    const result = await controller.generateChart(dto);
    
    expect(result.meta).toBeDefined();
    expect(result.meta?.count).toBe(8);
  });
});
