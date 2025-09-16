import { Repository } from 'typeorm';
import { Conversation } from '../chat/entities/conversations.entity';
import { Message } from '../chat/entities/messages.entity';
export declare class ChatController {
    private conversationRepo;
    private messageRepo;
    constructor(conversationRepo: Repository<Conversation>, messageRepo: Repository<Message>);
    createConversation(customerName?: string): Promise<{
        linkId: string;
        url: string;
    }>;
    getHistory(linkId: string): Promise<Message[]>;
}
