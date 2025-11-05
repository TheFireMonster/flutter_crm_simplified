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

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um cliente', async () => {
    repo.create.mockReturnValue({ name: 'Ana' });
    repo.save.mockResolvedValue({ id: 1, name: 'Ana' });
    const result = await service.create({ name: 'Ana' });
    expect(repo.create).toHaveBeenCalledWith({ name: 'Ana' });
    expect(repo.save).toHaveBeenCalledWith({ name: 'Ana' });
    expect(result).toEqual({ id: 1, name: 'Ana' });
  });

  it('deve encontrar todos os clientes', async () => {
    repo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    expect(repo.find).toHaveBeenCalled();
  });

  it('deve encontrar um cliente', async () => {
    repo.findOneBy.mockResolvedValue({ id: 1, name: 'Ana' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Ana' });
    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  it('deve lançar se cliente não for encontrado', async () => {
    repo.findOneBy.mockResolvedValue(undefined);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um cliente', async () => {
    repo.update.mockResolvedValue({});
    repo.findOneBy.mockResolvedValue({ id: 1, name: 'Ana', email: 'ana@email.com' });
    const result = await service.update(1, { email: 'ana@email.com' });
    expect(repo.update).toHaveBeenCalledWith(1, { email: 'ana@email.com' });
    expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@email.com' });
  });

  it('deve remover um cliente', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });
    const result = await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({ affected: 1 });
  });

  it('deve lançar se cliente não for encontrado ao remover', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
