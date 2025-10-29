import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/users.entity';
import { Customer } from './customers/entities/customers.entity';
import { Appointment } from './appointments/entities/appointments.entity';
import { Sale } from './sales/entities/sales.entity';
import { Service } from './services/entities/service.entity';
import { Message } from './chat/entities/messages.entity';
import { Conversation } from './chat/entities/conversations.entity';
import { AiAction } from './ai-actions/entities/ai-action.entity';

config();

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}


const dataSource = new DataSource({
  type: 'postgres',
  //host: process.env.DB_HOST,
  //port: Number(process.env.DB_PORT),
  //username: process.env.DB_USER,
  //password: process.env.DB_PASSWORD,
  //database: process.env.DB_NAME,
  url: process.env.DB_URL,
  entities: [User, Customer, Appointment, Sale, Message, Conversation, Service, AiAction],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

dataSource.initialize()
  .then(() => {
    console.log('✅ Database connected');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

export default dataSource;