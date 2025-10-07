import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/messages.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async saveMessage(conversationId: string, sender: string, text: string) {
    const msg = this.messageRepo.create({
      conversation: { id: conversationId },
      sender,
      content: text,
    });
    return this.messageRepo.save(msg);
  }
}