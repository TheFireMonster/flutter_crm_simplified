import { Test, TestingModule } from '@nestjs/testing';
import { CustomersAiService } from './customers.ai.service';
import { CustomersService } from './customers.service';
import { AiActionsService } from '../ai-actions/ai-actions.service';

describe('CustomersAiService', () => {
  let service: CustomersAiService;
  const customersServiceMock = { create: jest.fn().mockImplementation((c) => ({ id: 123, ...c })), findOne: jest.fn() } as any;
  const aiActionsMock = { reserve: jest.fn().mockResolvedValue({ inserted: true, record: null }), finalize: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersAiService,
        { provide: CustomersService, useValue: customersServiceMock },
        { provide: AiActionsService, useValue: aiActionsMock },
      ],
    }).compile();
    service = module.get<CustomersAiService>(CustomersAiService);
  });

  it('should create a customer from AI dto and finalize action', async () => {
    const dto = { name: 'Teste', email: 't@t.com', requestId: 'r1' } as any;
    const created = await service.createDraftFromAi(dto);
    expect(created).toBeDefined();
    expect((created as any).id).toBe(123);
    expect(aiActionsMock.finalize).toHaveBeenCalledWith('r1', 'customers', 123);
  });
});
