import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { Conversation } from './entities/conversations.entity';
import { CustomersService } from '../customers/customers.service';
import { CustomerAudit } from '../customers/entities/customer-audit.entity';


@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly customersService: CustomersService,
    @InjectRepository(CustomerAudit)
    private readonly auditRepo: Repository<CustomerAudit>,
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

  // Update or create a customer related to a conversation (by linkId).
  // If the conversation already has a customerId, update that customer.
  // Otherwise create a new customer with source='chat-lead' and link it to the conversation.
  async updateCustomerForConversation(conversationLinkId: string, updateData: Partial<any>, changedBy?: string) {
    const conv = await this.conversationRepo.findOne({ where: { linkId: conversationLinkId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    if (conv.customerId) {
      // update existing
      const before = await this.customersService.findOne(conv.customerId);
      const updated = await this.customersService.update(conv.customerId, updateData);

      // compute diff
      const changes: Record<string, { before: any; after: any }> = {};
      for (const k of Object.keys(updateData)) {
        const prev = (before as any)[k];
        const next = (updated as any)[k];
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
          changes[k] = { before: prev, after: next };
        }
      }

      // save audit if any change
      if (Object.keys(changes).length > 0) {
        await this.auditRepo.save({
          customerId: conv.customerId,
          conversationLinkId: conversationLinkId,
          changedBy: changedBy || 'chat',
          changes,
        } as any);
      }

      return updated;
    }

    // create a new customer (mark source as chat-lead)
    const created = await this.customersService.create({ ...updateData, source: 'chat-lead' });
    // link conversation to new customer
    conv.customerId = (created as any).id;
    await this.conversationRepo.save(conv);

    // audit record for creation
    await this.auditRepo.save({
      customerId: (created as any).id,
      conversationLinkId: conversationLinkId,
      changedBy: changedBy || 'chat',
      changes: { created: updateData },
    } as any);

    return created;
  }
}