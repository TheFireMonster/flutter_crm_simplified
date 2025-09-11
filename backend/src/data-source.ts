import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/users.entity';
import { Permission } from './permissions/entities/permissions.entity';
import { Customer } from './customers/entities/customers.entity';
import { CustomerReport } from './customer-reports/entities/customer-reports.entity';
import { Appointment } from './appointments/entities/appointments.entity';
import { Sale } from './sales/entities/sales.entity';
import { Setting } from './settings/entities/settings.entity';
import { Ticket } from './tickets/entities/tickets.entity';
import { Message } from './chat/entities/messages.entity';
import { Conversation } from './chat/entities/conversations.entity';

config();

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Permission, Customer, Appointment, Sale, Setting, CustomerReport, Ticket, Message, Conversation],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});