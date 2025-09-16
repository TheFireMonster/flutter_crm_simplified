import { Repository } from 'typeorm';
import { Message } from './entities/messages.entity';
export declare class ChatService {
    private readonly messageRepo;
    constructor(messageRepo: Repository<Message>);
    saveMessage(conversationId: string, sender: 'client' | 'staff', text: string): Promise<Message>;
}
