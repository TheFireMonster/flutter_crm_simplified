import { Repository } from 'typeorm';
import { Conversation } from '../chat/entities/conversations.entity';
import { CustomersService } from '../customers/customers.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Message } from '../chat/entities/messages.entity';
export declare class ChatController {
    private conversationRepo;
    private messageRepo;
    private readonly customersService?;
    constructor(conversationRepo: Repository<Conversation>, messageRepo: Repository<Message>, customersService?: CustomersService | undefined);
    updateConversation(linkId: string, body: UpdateConversationDto): Promise<{
        error: string;
        success?: undefined;
        customerName?: undefined;
        AIChatActive?: undefined;
    } | {
        success: boolean;
        customerName: string;
        AIChatActive: boolean;
        error?: undefined;
    }>;
    getConversation(linkId: string): Promise<{
        error: string;
        linkId?: undefined;
        customerName?: undefined;
        chatGptActive?: undefined;
    } | {
        linkId: string;
        customerName: string;
        chatGptActive: boolean;
        error?: undefined;
    }>;
    createConversation(dto: CreateConversationDto): Promise<{
        linkId: string;
        url: string;
        customerId: number | undefined;
        error?: undefined;
        details?: undefined;
    } | {
        error: string;
        details: any;
        linkId?: undefined;
        url?: undefined;
        customerId?: undefined;
    }>;
    getHistory(linkId: string): Promise<Message[]>;
}
