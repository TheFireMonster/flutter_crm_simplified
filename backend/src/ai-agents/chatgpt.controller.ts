import { Controller, Post, Body } from '@nestjs/common';
import { ChatGptService } from './chatgpt.service';

@Controller('chatgpt')
export class ChatGptController {
  constructor(private readonly chatGptService: ChatGptService) {}

  @Post('ask')
  async ask(@Body('prompt') prompt: string): Promise<{ response: string }> {
    const response = await this.chatGptService.ask(prompt);
    return { response };
  }
}
