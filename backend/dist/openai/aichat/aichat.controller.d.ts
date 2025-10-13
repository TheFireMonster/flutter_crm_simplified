import { AIChatService } from './aichat.service';
export declare class AIChatController {
    private readonly chatGptService;
    constructor(chatGptService: AIChatService);
    ask(prompt: string): Promise<{
        response: string;
    }>;
}
