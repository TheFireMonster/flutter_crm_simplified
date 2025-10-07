
import { Module } from '@nestjs/common';
import { AiAgentsController } from './ai-agents.controller';
import { AiAgentsService } from './ai-agents.service';
import { ChatGptModule } from './chatgpt.module';
import { ChatGptController } from './chatgpt.controller';

@Module({
  imports: [ChatGptModule],
  controllers: [AiAgentsController, ChatGptController],
  providers: [AiAgentsService],
})
export class AiAgentsModule {}
