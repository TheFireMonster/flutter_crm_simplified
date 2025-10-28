import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointments.entity';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const mockQueryBuilder: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const mockRepo: any = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should detect overlap when query returns a record', async () => {
    const repo: any = (service as any).appointmentRepo;
    const qb: any = repo.createQueryBuilder();
    qb.getOne.mockResolvedValue({ id: 1 });

    const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
    expect(result).toBe(true);
  });

  it('should return false when no overlap', async () => {
    const repo: any = (service as any).appointmentRepo;
    const qb: any = repo.createQueryBuilder();
    qb.getOne.mockResolvedValue(null);

    const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
    expect(result).toBe(false);
  });
});
