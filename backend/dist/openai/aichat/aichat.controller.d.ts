import { AIChatService } from './aichat.service';
import { PromptDto } from '../dto/prompt.dto';
export declare class AIChatController {
    private readonly chatGptService;
    constructor(chatGptService: AIChatService);
    ask(body: PromptDto): Promise<{
        response: string;
    }>;
}
