import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';
import { GenerateChartController } from './generate-chart.controller';
import { CustomersModule } from '../customers/customers.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { AiActionsModule } from '../ai-actions/ai-actions.module';

@Module({
  imports: [CustomersModule, AppointmentsModule, AiActionsModule],
  controllers: [DebugController, GenerateChartController],
})
export class DebugModule {}
