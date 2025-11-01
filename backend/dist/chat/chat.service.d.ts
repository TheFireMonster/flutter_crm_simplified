import { Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
import { Conversation } from './entities/conversations.entity';
import { CustomersService } from '../customers/customers.service';
import { CustomerAudit } from '../customers/entities/customer-audit.entity';
export declare class ChatService {
    private readonly messageRepo;
    private readonly conversationRepo;
    private readonly customersService;
    private readonly auditRepo;
    constructor(messageRepo: Repository<Message>, conversationRepo: Repository<Conversation>, customersService: CustomersService, auditRepo: Repository<CustomerAudit>);
    saveMessage(conversationId: string, sender: string, text: string): Promise<Message>;
    getRecentMessages(conversationId: string, limit?: number): Promise<Message[]>;
    updateCustomerForConversation(conversationLinkId: string, updateData: Partial<any>, changedBy?: string): Promise<import("../customers/entities/customers.entity").Customer>;
}
