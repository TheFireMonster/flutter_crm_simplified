import { Controller, Post, Body } from '@nestjs/common';
import { AIChatService } from './aichat.service';
import { PromptDto } from '../dto/prompt.dto';

@Controller('aichat')
export class AIChatController {
  constructor(private readonly chatGptService: AIChatService) {}

  @Post('ask')
  async ask(@Body() body: PromptDto): Promise<{ response: string }> {
    const response = await this.chatGptService.ask(body.prompt);
    return { response };
  }
}
