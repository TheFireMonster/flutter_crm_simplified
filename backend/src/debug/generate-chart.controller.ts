import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class GenerateChartController {
  @Post('generate_chart')
  generate(@Body() body: any) {
    
    const now = new Date();
    const labels = [
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      now.toISOString().slice(0, 10),
    ];
    const series = [[5, 7, 3]];
    return { ok: true, labels, series, received: body };
  }
}
