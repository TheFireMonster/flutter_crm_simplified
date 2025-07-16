import { Test, TestingModule } from '@nestjs/testing';
import { CustomerReportsService } from './customer-reports.service';

describe('CustomerReportsService', () => {
  let service: CustomerReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerReportsService],
    }).compile();

    service = module.get<CustomerReportsService>(CustomerReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
