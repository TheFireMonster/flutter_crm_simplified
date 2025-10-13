import { Controller, Post, Body } from '@nestjs/common';
import { AIChatService } from './aichat.service';

@Controller('aichat')
export class AIChatController {
  constructor(private readonly chatGptService: AIChatService) {}

  @Post('ask')
  async ask(@Body('prompt') prompt: string): Promise<{ response: string }> {
    const response = await this.chatGptService.ask(prompt);
    return { response };
  }
}
