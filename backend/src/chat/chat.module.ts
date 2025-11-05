import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';
import { AIChatModule } from '../openai/aichat/aichat.module';
import { CustomersModule } from '../customers/customers.module';
import { CustomerAudit } from '../customers/entities/customer-audit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([CustomerAudit]),
    forwardRef(() => AIChatModule),
    CustomersModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}