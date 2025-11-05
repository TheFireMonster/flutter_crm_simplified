import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';

describe('AuditLogController', () => {
  let controller: AuditLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
