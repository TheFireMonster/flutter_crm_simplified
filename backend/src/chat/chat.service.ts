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

  // Return recent messages for a conversation ordered chronologically (oldest-first).
  // Used to include context/history when calling the AI. Limit should be small to avoid
  // hitting token limits; callers may choose a smaller limit.
  async getRecentMessages(conversationId: string, limit = 20) {
    return this.messageRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.conversation', 'c')
      .where('c.id = :id', { id: conversationId })
      .orderBy('m.createdAt', 'ASC')
      .take(limit)
      .getMany();
  }
}