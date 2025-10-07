import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
import { ChatGptService } from '../ai-agents/chatgpt.service';
export declare class ChatGateway {
    private readonly chatService;
    private readonly conversationRepo;
    private readonly chatGptService;
    handleTyping(data: {
        conversationId: string;
        sender: string;
    }, client: Socket): void;
    server: Server;
    constructor(chatService: ChatService, conversationRepo: Repository<Conversation>, chatGptService: ChatGptService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(conversationId: string, client: Socket): void;
    onMessage(data: {
        conversationId: string;
        sender: 'client' | 'staff';
        text: string;
    }, client: Socket): Promise<void>;
}
