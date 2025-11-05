import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';

describe('ReportsController', () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
