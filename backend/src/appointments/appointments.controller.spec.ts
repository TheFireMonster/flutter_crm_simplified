import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointments.entity';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: getRepositoryToken(Appointment), useValue: { find: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: AppointmentsService, useValue: { hasOverlap: jest.fn().mockResolvedValue(false) } },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
