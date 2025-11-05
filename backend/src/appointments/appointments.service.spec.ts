import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointments.entity';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repo: any;

  beforeEach(async () => {
    const mockQueryBuilder: any = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    };

    repo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: repo },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe('hasOverlap', () => {
    it('deve detectar sobreposiÃ§Ã£o total', async () => {
      const qb: any = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ 
        id: 1, 
        date: '2025-10-17', 
        startTime: '09:00:00', 
        endTime: '10:00:00' 
      });

      const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
      expect(result).toBe(true);
    });

    it('deve detectar sobreposiÃ§Ã£o parcial no inÃ­cio', async () => {
      const qb: any = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ 
        id: 2, 
        date: '2025-10-17', 
        startTime: '09:30:00', 
        endTime: '10:30:00' 
      });

      // Novo agendamento: 09:00-10:00 (sobrepÃµe com 09:30-10:00)
      const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
      expect(result).toBe(true);
    });

    it('deve detectar sobreposiÃ§Ã£o parcial no final', async () => {
      const qb: any = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ 
        id: 3, 
        date: '2025-10-17', 
        startTime: '08:00:00', 
        endTime: '09:30:00' 
      });

      // Novo agendamento: 09:00-10:00 (sobrepÃµe com 09:00-09:30)
      const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
      expect(result).toBe(true);
    });

    it('deve retornar falso quando nÃ£o hÃ¡ sobreposiÃ§Ã£o', async () => {
      const qb: any = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);

      const result = await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');
      expect(result).toBe(false);
    });

    it('deve verificar consulta SQL correta para sobreposiÃ§Ã£o', async () => {
      const qb: any = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);

      await service.hasOverlap('2025-10-17', '09:00:00', '10:00:00');

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('a');
      expect(qb.where).toHaveBeenCalledWith('a.appointmentDate = :date', { date: '2025-10-17' });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'NOT (a.endTime <= :start OR a.startTime >= :end)',
        { start: '09:00:00', end: '10:00:00' }
      );
    });
  });

  describe('create', () => {
    it('deve criar agendamento com dados vÃ¡lidos', async () => {
      const appointmentData = {
        title: 'Consulta',
        description: 'Primeira consulta',
        appointmentDate: '2025-10-17',
        startTime: '09:00:00',
        endTime: '10:00:00',
        customerId: 1,
        customerName: 'JoÃ£o Silva'
      };
      
      repo.create.mockReturnValue(appointmentData);
      repo.save.mockResolvedValue({ id: 1, ...appointmentData });

      const result = await service.create(appointmentData);

      expect(result).toEqual({ id: 1, ...appointmentData });
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
