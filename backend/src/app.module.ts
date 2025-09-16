import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerReportsModule } from './customer-reports/customer-reports.module';
import { TicketsModule } from './tickets/tickets.module';
import { SalesModule } from './sales/sales.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import dataSource from './data-source'; 
import { AiAgentsModule } from './ai-agents/ai-agents.module';
import { AuditModule } from './audit/audit.module';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CustomersModule,
    UsersModule,
    SettingsModule,
    AppointmentsModule,
    TypeOrmModule.forRoot(dataSource.options),
  // PermissionsModule removed for simple Firebase login
    CustomerReportsModule,
    TicketsModule,
    SalesModule,
    AiAgentsModule,
    AuditModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}