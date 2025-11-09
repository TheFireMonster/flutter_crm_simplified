import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CustomersAiService } from '../customers/customers.ai.service';
import { AppointmentsAiService } from '../appointments/appointments.ai.service';
import { AiActionsService } from '../ai-actions/ai-actions.service';

@Controller('debug')
export class DebugController {
  constructor(
    private customersAi: CustomersAiService,
    private appointmentsAi: AppointmentsAiService,
    private aiActionsService: AiActionsService,
  ) {}

  @Post('ai-action')
  async aiAction(@Body() body: { type: 'customer' | 'appointment'; payload: any }) {
    if (body.type === 'customer') {
      return this.customersAi.createFromAi(body.payload);
    }
    return this.appointmentsAi.createFromAi(body.payload);
  }

  @Get('ai-action/:requestId')
  async getAiAction(@Param('requestId') requestId: string) {
    return this.aiActionsService.findByRequestId(requestId);
  }
}
