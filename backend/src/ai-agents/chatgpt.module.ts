
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChatGptService } from './chatgpt.service';
import { ConfigModule } from '@nestjs/config';
import { ProductsServicesModule } from '../products_services/products_services.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [HttpModule, ConfigModule, ProductsServicesModule, AppointmentsModule],
  providers: [ChatGptService],
  exports: [ChatGptService],
})
export class ChatGptModule {}
