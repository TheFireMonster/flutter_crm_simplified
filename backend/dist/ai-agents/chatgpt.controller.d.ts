import { ChatGptService } from './chatgpt.service';
export declare class ChatGptController {
    private readonly chatGptService;
    constructor(chatGptService: ChatGptService);
    ask(prompt: string): Promise<{
        response: string;
    }>;
}
