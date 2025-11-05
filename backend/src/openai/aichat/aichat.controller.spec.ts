import { Test, TestingModule } from '@nestjs/testing';
import { AIChatController } from './aichat.controller';
import { AIChatService } from './aichat.service';

describe('AIChatController', () => {
  let controller: AIChatController;
  let service: AIChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIChatController],
      providers: [
        {
          provide: AIChatService,
          useValue: {
            ask: jest.fn().mockResolvedValue('mocked response')
          }
        }
      ],
    }).compile();

    controller = module.get<AIChatController>(AIChatController);
    service = module.get<AIChatService>(AIChatService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar resposta do serviço', async () => {
    const dto = { prompt: 'Olá, assistente!' } as any;
    const result = await controller.ask(dto);
    expect(result).toEqual({ response: 'mocked response' });
  });
});
