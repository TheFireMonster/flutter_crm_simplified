import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
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

  @Patch('conversations/:linkId')
  async updateConversation(
    @Param('linkId') linkId: string,
    @Body() body: { customerName?: string; chatGptActive?: boolean }
  ) {
    const conv = await this.conversationRepo.findOne({ where: { linkId } });
    if (!conv) {
      return { error: 'Conversation not found' };
    }
    if (body.customerName !== undefined) {
      conv.customerName = body.customerName;
    }
    if (body.chatGptActive !== undefined) {
      conv.chatGptActive = body.chatGptActive;
    }
    await this.conversationRepo.save(conv);
    return { success: true, customerName: conv.customerName, chatGptActive: conv.chatGptActive };
  }
  
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
      url: `http://localhost:3000/chat/${saved.linkId}`,
    };
  }

  @Get('history/:linkId')
  async getHistory(@Param('linkId') linkId: string) {
    return this.messageRepo.find({
      where: { conversation: { linkId } },
      order: { createdAt: 'ASC' },
      relations: ['conversation'],
    });
  }
}