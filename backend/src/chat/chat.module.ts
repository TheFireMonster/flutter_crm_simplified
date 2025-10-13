
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';
import { AIChatModule } from '../openai/aichat/aichat.module';
import { AIChatService } from '../openai/aichat/aichat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
    AIChatModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}