import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
import { AIChatService } from '../openai/aichat/aichat.service';
export declare class ChatGateway {
    private readonly chatService;
    private readonly conversationRepo;
    private readonly aiChatService;
    handleTyping(data: {
        conversationId: string;
        sender: string;
    }, client: Socket): void;
    server: Server;
    constructor(chatService: ChatService, conversationRepo: Repository<Conversation>, aiChatService: AIChatService);
    handleUpdateCustomer(data: {
        conversationId: string;
        update: Record<string, any>;
    }, client: Socket): Promise<void>;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        conversationId: string;
        token: string;
    }, client: Socket): Promise<{
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    onMessage(data: {
        conversationId: string;
        sender: 'client' | 'staff';
        text: string;
        token?: string;
    }, client: Socket): Promise<{
        error: string;
    } | undefined>;
}
