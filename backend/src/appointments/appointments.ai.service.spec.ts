import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsAiService } from './appointments.ai.service';
import { AiActionsService } from '../ai-actions/ai-actions.service';
import { AppointmentsService } from './appointments.service';
import { CustomersService } from '../customers/customers.service';

describe('AppointmentsAiService', () => {
  let service: AppointmentsAiService;
  const aiActionsMock = { reserve: jest.fn().mockResolvedValue({ inserted: true, record: null }), finalize: jest.fn() } as any;
  const appointmentsServiceMock = { create: jest.fn().mockImplementation((a) => ({ id: 456, ...a })), getAll: jest.fn() } as any;
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

  it('should create an appointment from AI payload and finalize', async () => {
    const now = new Date().toISOString();
    const dto = { customerId: 1, startAt: now, durationMinutes: 60, requestId: 'r2' } as any;
    const created = await service.createDraftFromAi(dto);
    expect(created).toBeDefined();
    expect((created as any).id).toBe(456);
    expect(aiActionsMock.finalize).toHaveBeenCalledWith('r2', 'appointments', 456);
    // We do not modify customer.source as there is no separate 'lead' concept
    expect(customersServiceMock.update).not.toHaveBeenCalled();
  });
});
