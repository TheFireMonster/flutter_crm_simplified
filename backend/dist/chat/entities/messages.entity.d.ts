import { Conversation } from '../entities/conversations.entity';
export declare class Message {
    id: string;
    sender: string;
    content: string;
    createdAt: Date;
    conversation: Conversation;
}
