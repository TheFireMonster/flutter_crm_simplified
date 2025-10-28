import { Controller, Post, Body } from '@nestjs/common';
import { ChartAIService } from './chartai.service';
import { PromptDto } from '../dto/prompt.dto';

@Controller('chartai')
export class ChartAIController {
  constructor(private readonly chartAIService: ChartAIService) {}

  @Post('generate')
  async generateChart(@Body() body: PromptDto) {
    return this.chartAIService.generateChart(body.prompt);
  }
}