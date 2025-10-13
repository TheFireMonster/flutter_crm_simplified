import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './entities/customers.entity';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getRepositoryToken(Customer), useValue: repo },
      ],
    }).compile();
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a customer', async () => {
    repo.create.mockReturnValue({ name: 'Ana' });
    repo.save.mockResolvedValue({ id: 1, name: 'Ana' });
    const result = await service.create({ name: 'Ana' });
    expect(repo.create).toHaveBeenCalledWith({ name: 'Ana' });
    expect(repo.save).toHaveBeenCalledWith({ name: 'Ana' });
    expect(result).toEqual({ id: 1, name: 'Ana' });
  });

  it('should find all customers', async () => {
    repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should find one customer', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1, name: 'Ana' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Ana' });
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('should throw if customer not found', async () => {
    repo.findOneBy.mockResolvedValue(undefined);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update a customer', async () => {
    repo.update.mockResolvedValue({});
    repo.findOneBy.mockResolvedValue({ id: 1, name: 'Ana', email: 'ana@email.com' });
    const result = await service.update(1, { email: 'ana@email.com' });
    expect(repo.update).toHaveBeenCalledWith(1, { email: 'ana@email.com' });
    expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@email.com' });
  });

  it('should remove a customer', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });
    const result = await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw if customer not found on remove', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
