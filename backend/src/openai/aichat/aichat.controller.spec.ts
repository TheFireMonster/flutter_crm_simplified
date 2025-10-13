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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return response from service', async () => {
    const result = await controller.ask('Olá, assistente!');
    expect(result).toEqual({ response: 'mocked response' });
  });
});
