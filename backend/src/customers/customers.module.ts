import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomersAiService } from './customers.ai.service';
import { AiActionsModule } from '../ai-actions/ai-actions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customers.entity';
import { CustomerAudit } from './entities/customer-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, CustomerAudit]), AiActionsModule],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersAiService],
  exports: [CustomersService, CustomersAiService]
})
export class CustomersModule {}
