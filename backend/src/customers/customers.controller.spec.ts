import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn().mockResolvedValue({ id: 1, name: 'Ana' }),
      findAll: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Ana' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Ana', email: 'ana@email.com' }),
      remove: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomersService, useValue: serviceMock },
      ],
    }).compile();
    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

    it('should create a customer', async () => {
    const body = { name: 'Ana' };
    const result = await controller.create(body as any);
    expect(result).toEqual({ id: 1, name: 'Ana' });
  });

  it('should find all customers', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('should find one customer', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1, name: 'Ana' });
  });

  it('should update a customer', async () => {
    const body = { name: 'Ana Updated' };
    const result = await controller.update('1', body as any);
    expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@email.com' });
  });

  it('should remove a customer', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ affected: 1 });
  });
});
