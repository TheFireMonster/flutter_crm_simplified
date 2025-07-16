import { Test, TestingModule } from '@nestjs/testing';
import { CustomerReportsController } from './customer-reports.controller';

describe('CustomerReportsController', () => {
  let controller: CustomerReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerReportsController],
    }).compile();

    controller = module.get<CustomerReportsController>(CustomerReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
