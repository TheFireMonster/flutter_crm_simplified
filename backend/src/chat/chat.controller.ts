import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../chat/entities/conversations.entity';
import { Message } from '../chat/entities/messages.entity';

@Controller('chat')
export class ChatController {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  // Criar conversa e gerar link único
  @Post('conversations')
  async createConversation(@Body('customerName') customerName?: string) {
    const linkId = uuidv4();

    const conv = this.conversationRepo.create({
      linkId,
      customerName: customerName || 'Cliente',
    });

    const saved = await this.conversationRepo.save(conv);

    return {
      linkId: saved.linkId,
      url: `https://localhost:3000/chat/${saved.linkId}`,
    };
  }

  // Buscar histórico pelo linkId (usado no frontend do cliente ou do funcionário)
  @Get('history/:linkId')
  async getHistory(@Param('linkId') linkId: string) {
    return this.messageRepo.find({
      where: { conversation: { linkId } },
      order: { createdAt: 'ASC' },
      relations: ['conversation'],
    });
  }
}