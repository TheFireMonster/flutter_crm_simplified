import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from './permissions/permissions.module';
import { CustomerReportsModule } from './customer-reports/customer-reports.module';
import { TicketsModule } from './tickets/tickets.module';
import { SalesModule } from './sales/sales.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [AuthModule, CustomersModule, UsersModule, SettingsModule, AppointmentsModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'your_username',
    password: 'your_password',  
    database: 'your_database',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    synchronize: true, //use false in production
    logging: ['query', 'error'],
    logger: 'advanced-console',
  }), PermissionsModule, CustomerReportsModule, TicketsModule, SalesModule, WebhookModule],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
