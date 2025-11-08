import { Message } from '../entities/messages.entity';
export declare class Conversation {
    id: string;
    linkId: string;
    accessToken: string;
    customerName: string;
    customerId?: number;
    createdAt: Date;
    AIChatActive: boolean;
    messages: Message[];
}
