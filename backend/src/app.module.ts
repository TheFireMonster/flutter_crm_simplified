import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerReportsModule } from './customer-reports/customer-reports.module';
import { TicketsModule } from './tickets/tickets.module';
import { SalesModule } from './sales/sales.module';
import { ConfigModule } from '@nestjs/config';
import dataSource from './data-source';

import { AuditModule } from './audit/audit.module';
import { ChatModule } from './chat/chat.module';
import { ProductsServicesModule } from './products_services/products_services.module';
import { AIChatModule } from './openai/aichat/aichat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CustomersModule,
    UsersModule,
    SettingsModule,
    AppointmentsModule,
    TypeOrmModule.forRoot(dataSource.options),
    CustomerReportsModule,
    TicketsModule,
    SalesModule,
    AIChatModule,
    AuditModule,
    ChatModule,
    ProductsServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}