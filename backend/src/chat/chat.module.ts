import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    TypeOrmModule.forFeature([Message]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}