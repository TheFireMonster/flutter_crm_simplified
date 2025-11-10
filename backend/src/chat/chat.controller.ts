import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { Conversation } from '../chat/entities/conversations.entity';
import { CustomersService } from '../customers/customers.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Message } from '../chat/entities/messages.entity';

@Controller('chat')
export class ChatController {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    private readonly customersService?: CustomersService,
  ) {}

  @Patch('conversations/:linkId')
  async updateConversation(
    @Param('linkId') linkId: string,
    @Body() body: UpdateConversationDto
  ) {
    const conv = await this.conversationRepo.findOne({ where: { linkId } });
    if (!conv) {
      return { error: 'Conversation not found' };
    }
    if (body.customerName !== undefined) {
      conv.customerName = body.customerName;
    }
    if (body.AIChatActive !== undefined) {
      conv.AIChatActive = body.AIChatActive;
    } else if (body.chatGptActive !== undefined) {
      conv.AIChatActive = body.chatGptActive;
    }
    await this.conversationRepo.save(conv);
    return { success: true, customerName: conv.customerName, AIChatActive: conv.AIChatActive };
  }

  @Get('conversations/:linkId')
  async getConversation(@Param('linkId') linkId: string) {
    const conv = await this.conversationRepo.findOne({ where: { linkId } });
    if (!conv) return { error: 'Conversation not found' };
    return { linkId: conv.linkId, customerName: conv.customerName, chatGptActive: conv.AIChatActive };
  }
  
  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    try {
      const linkId = uuidv4();
      const accessToken = randomBytes(4).toString('hex');
      const apiBase = process.env.API_BASE_URL || 'http://localhost:3000';

  const customer = await (this.customersService ? this.customersService.findOrCreateCustomer({ id: dto?.customerId, name: dto?.customerName }) : null);

      const conv = this.conversationRepo.create({
        linkId,
        accessToken,
        customerName: dto?.customerName || (customer ? customer.name : 'Cliente'),
      });

      const saved = await this.conversationRepo.save(conv);

      if (customer && customer.id) {
        saved.customerId = customer.id;
        await this.conversationRepo.save(saved);
      }

      return {
        linkId: saved.linkId,
        accessToken: saved.accessToken,
        url: `${apiBase}/chat/${saved.linkId}/${saved.accessToken}`,
        customerId: customer ? customer.id : undefined,
      };
    } catch (err) {
      console.error('createConversation error:', err && err.stack ? err.stack : err);
      return { error: 'Failed to create conversation', details: err?.message || String(err) };
    }
  }

  @Get('history/:linkId/:token')
  async getHistory(@Param('linkId') linkId: string, @Param('token') token: string) {
    const conv = await this.conversationRepo.findOne({ where: { linkId } });
    if (!conv) {
      return { error: 'Conversa não encontrada. Link inválido.' };
    }
    if (conv.accessToken !== token) {
      return { error: 'Token inválido. Acesso negado.' };
    }
    
    return this.messageRepo.find({
      where: { conversation: { linkId } },
      order: { createdAt: 'ASC' },
      relations: ['conversation'],
    });
  }
}