import { Repository } from 'typeorm';
import { Conversation } from '../chat/entities/conversations.entity';
import { Message } from '../chat/entities/messages.entity';
export declare class ChatController {
    private conversationRepo;
    private messageRepo;
    constructor(conversationRepo: Repository<Conversation>, messageRepo: Repository<Message>);
    updateConversation(linkId: string, body: {
        customerName?: string;
        chatGptActive?: boolean;
    }): Promise<{
        error: string;
        success?: undefined;
        customerName?: undefined;
        chatGptActive?: undefined;
    } | {
        success: boolean;
        customerName: string;
        chatGptActive: boolean;
        error?: undefined;
    }>;
    createConversation(customerName?: string): Promise<{
        linkId: string;
        url: string;
    }>;
    getHistory(linkId: string): Promise<Message[]>;
}
