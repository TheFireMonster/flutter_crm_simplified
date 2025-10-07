
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';
import { ChatGptModule } from '../ai-agents/chatgpt.module';
import { ChatGptService } from '../ai-agents/chatgpt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
    ChatGptModule,
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}