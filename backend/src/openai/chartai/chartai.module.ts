import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { ChartAIService } from './chartai.service';
import { ChartAIController } from './chartai.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../../appointments/entities/appointments.entity';
import { Customer } from '../../customers/entities/customers.entity';
import { Service } from '../../services/entities/service.entity';
import { Sale } from '../../sales/entities/sales.entity';

@Module({
  imports: [HttpModule, ConfigModule, TypeOrmModule.forFeature([Appointment, Customer, Service, Sale])],
  providers: [ChartAIService],
  controllers: [ChartAIController],
  exports: [ChartAIService],
})
export class ChartAIModule {}
