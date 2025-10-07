import { Message } from '../entities/messages.entity';
export declare class Conversation {
    id: string;
    linkId: string;
    customerName: string;
    createdAt: Date;
    chatGptActive: boolean;
    messages: Message[];
}
