import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';
import { AIChatModule } from '../openai/aichat/aichat.module';
import { CustomersModule } from '../customers/customers.module';
import { CustomerAudit } from 'src/customers/entities/customer-audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => AIChatModule),
    CustomersModule,
  ],
  providers: [ChatGateway, ChatService, CustomerAudit],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}