import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ServiceService } from '../../services/service.service';
import { AppointmentsService } from '../../appointments/appointments.service';
import { CustomersAiService } from '../../customers/customers.ai.service';
import { CustomersService } from '../../customers/customers.service';
import { AppointmentsAiService } from '../../appointments/appointments.ai.service';
import { ChatService } from '../../chat/chat.service';
export declare class AIChatService {
    private readonly httpService;
    private readonly configService;
    private readonly serviceService;
    private readonly appointmentsService;
    private readonly customersAiService;
    private readonly customersService;
    private readonly appointmentsAiService;
    private readonly chatService;
    constructor(httpService: HttpService, configService: ConfigService, serviceService: ServiceService, appointmentsService: AppointmentsService, customersAiService: CustomersAiService, customersService: CustomersService, appointmentsAiService: AppointmentsAiService, chatService: ChatService);
    ask(prompt: string, conversationId?: string, customerName?: string, customerId?: number): Promise<string>;
}
