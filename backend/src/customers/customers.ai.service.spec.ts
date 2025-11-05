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

  it('deve criar um cliente a partir do DTO da IA e finalizar a ação', async () => {
    const dto = { name: 'Teste', email: 't@t.com', requestId: 'r1' } as any;
    const created = await service.createDraftFromAi(dto);
    expect(created).toBeDefined();
    expect((created as any).id).toBe(123);
    expect(aiActionsMock.finalize).toHaveBeenCalledWith('r1', 'customers', 123);
  });

  it('deve lidar com latência em aiActions.reserve e ainda criar o cliente', async () => {
    aiActionsMock.reserve.mockImplementation(() => new Promise((res) => setTimeout(() => res({ inserted: true, record: null }), 1500)));
    jest.useFakeTimers();
    const dto = { name: 'Teste 2', email: 't2@t.com', requestId: 'r5' } as any;
    const p = service.createDraftFromAi(dto);
    jest.advanceTimersByTime(1500);
    const created = await p;
    expect(created).toBeDefined();
    expect((created as any).id).toBe(123);
    jest.useRealTimers();
  });

  it('deve propagar erros de aiActions.reserve (por exemplo, 429)', async () => {
    aiActionsMock.reserve.mockImplementation(() => Promise.reject({ response: { status: 429, data: 'rate limit' } }));
    const dto = { name: 'Teste 3', email: 't3@t.com', requestId: 'r6' } as any;
    await expect(service.createDraftFromAi(dto)).rejects.toEqual({ response: { status: 429, data: 'rate limit' } });
  });
});
