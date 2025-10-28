import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsAiService } from './appointments.ai.service';
import { Appointment } from './entities/appointments.entity';
import { AiActionsModule } from '../ai-actions/ai-actions.module';
import { CustomersModule } from '../customers/customers.module';


@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AiActionsModule, CustomersModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsAiService],
  exports: [AppointmentsService, AppointmentsAiService],
})
export class AppointmentsModule {}
