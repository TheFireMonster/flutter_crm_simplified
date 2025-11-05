import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sale } from './entities/sales.entity';

describe('SalesService', () => {
  let service: SalesService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Sale), useValue: repo },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma venda', async () => {
      const createSaleDto = {
        serviceName: 'Consultoria',
        price: 1500.00,
        customerName: 'João Silva'
      };

      const mockSale = { id: 1, ...createSaleDto };
      repo.create.mockReturnValue(mockSale);
      repo.save.mockResolvedValue(mockSale);
      repo.findOne.mockResolvedValue(mockSale);

      const result = await service.create(createSaleDto);

      expect(repo.create).toHaveBeenCalledWith(createSaleDto);
      expect(repo.save).toHaveBeenCalledWith(mockSale);
      expect(repo.findOne).toHaveBeenCalledWith({ 
        where: { id: mockSale.id }, 
        relations: ['customer'] 
      });
      expect(result).toEqual(mockSale);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as vendas com relação customer', async () => {
      const mockSales = [
        { id: 1, amount: 1000 },
        { id: 2, amount: 2000 }
      ];

      repo.find.mockResolvedValue(mockSales);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({ relations: ['customer'] });
      expect(result).toEqual(mockSales);
    });
  });
});
