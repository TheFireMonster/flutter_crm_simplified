import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: { create: jest.fn(), findAll: jest.fn() } }],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
