import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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
    
    // Inject CustomersService to link conversations to leads
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
    // Accept either the server-side property name (AIChatActive) or the
    // frontend-friendly name (chatGptActive). This prevents mismatches when
    // the client sends { chatGptActive: true }.
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
    // Return the property name the frontend expects: chatGptActive
    return { linkId: conv.linkId, customerName: conv.customerName, chatGptActive: conv.AIChatActive };
  }
  
  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    try {
      const linkId = uuidv4();

      // find or create a lead by customerId or name
      const lead = await (this.customersService ? this.customersService.findOrCreateLead({ id: dto?.customerId, name: dto?.customerName }) : null);

      const conv = this.conversationRepo.create({
        linkId,
        customerName: dto?.customerName || (lead ? lead.name : 'Cliente'),
      });

      const saved = await this.conversationRepo.save(conv);

      // Persist the linked customerId into the conversation row for future lookups
      if (lead && lead.id) {
        saved.customerId = lead.id;
        await this.conversationRepo.save(saved);
      }

      return {
        linkId: saved.linkId,
        url: `http://localhost:3000/chat/${saved.linkId}`,
        customerId: lead ? lead.id : undefined,
      };
    } catch (err) {
      // Log full error server-side to help debugging and return a helpful message
      console.error('createConversation error:', err && err.stack ? err.stack : err);
      return { error: 'Failed to create conversation', details: err?.message || String(err) };
    }
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