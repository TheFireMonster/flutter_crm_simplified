import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsAiService } from './appointments.ai.service';
import { AiActionsService } from '../ai-actions/ai-actions.service';
import { AppointmentsService } from './appointments.service';
import { CustomersService } from '../customers/customers.service';

describe('AppointmentsAiService', () => {
  let service: AppointmentsAiService;
  const aiActionsMock = { reserve: jest.fn().mockResolvedValue({ inserted: true, record: null }), finalize: jest.fn() } as any;
  const appointmentsServiceMock = { create: jest.fn().mockImplementation((a) => ({ id: 456, ...a })), getAll: jest.fn(), hasOverlap: jest.fn().mockResolvedValue(false) } as any;
  const customersServiceMock = { update: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsAiService,
        { provide: AiActionsService, useValue: aiActionsMock },
        { provide: AppointmentsService, useValue: appointmentsServiceMock },
        { provide: CustomersService, useValue: customersServiceMock },
      ],
    }).compile();
    service = module.get<AppointmentsAiService>(AppointmentsAiService);
  });

  it('deve criar um agendamento a partir do payload da IA e finalizar', async () => {
    const now = new Date().toISOString();
    const dto = { customerId: 1, startAt: now, durationMinutes: 60, requestId: 'r2' } as any;
    const created = await service.createFromAi(dto);
    expect(created).toBeDefined();
    expect((created as any).id).toBe(456);
    expect(aiActionsMock.finalize).toHaveBeenCalledWith('r2', 'appointments', 456);
    expect(customersServiceMock.update).not.toHaveBeenCalled();
  });

  it('deve lidar com latência em aiActions.reserve e ainda criar o agendamento', async () => {
    aiActionsMock.reserve.mockImplementation(() => new Promise((res) => setTimeout(() => res({ inserted: true, record: null }), 50)));

    const now = new Date().toISOString();
    const dto = { customerId: 1, startAt: now, durationMinutes: 60, requestId: 'r3' } as any;
    const created = await service.createFromAi(dto);
    expect(created).toBeDefined();
    expect((created as any).id).toBe(456);
    expect(appointmentsServiceMock.hasOverlap).toHaveBeenCalled();
  });

  it('deve propagar erros de aiActions.reserve (por exemplo, 429)', async () => {
    aiActionsMock.reserve.mockImplementation(() => Promise.reject({ response: { status: 429, data: 'rate limit' } }));
    const now = new Date().toISOString();
    const dto = { customerId: 1, startAt: now, durationMinutes: 60, requestId: 'r4' } as any;
    await expect(service.createFromAi(dto)).rejects.toEqual({ response: { status: 429, data: 'rate limit' } });
  });
});
