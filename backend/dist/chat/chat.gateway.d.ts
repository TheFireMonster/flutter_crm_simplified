import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
export declare class ChatGateway {
    private readonly chatService;
    private readonly conversationRepo;
    server: Server;
    constructor(chatService: ChatService, conversationRepo: Repository<Conversation>);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(conversationId: string, client: Socket): void;
    onMessage(data: {
        conversationId: string;
        sender: 'client' | 'staff';
        text: string;
    }, client: Socket): Promise<void>;
}
