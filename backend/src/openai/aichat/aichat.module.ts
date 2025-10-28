import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIChatService } from './aichat.service';
import { ConfigModule } from '@nestjs/config';
import { AppointmentsModule } from '../../appointments/appointments.module';
import { ServiceModule } from '../../services/service.module';
import { CustomersModule } from '../../customers/customers.module';
import { ChatModule } from '../../chat/chat.module';

@Module({
  imports: [HttpModule, ConfigModule, AppointmentsModule, ServiceModule, CustomersModule, forwardRef(() => ChatModule)],
  providers: [AIChatService],
  exports: [AIChatService],
})
export class AIChatModule {}
