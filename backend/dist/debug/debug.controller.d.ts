import { CustomersAiService } from '../customers/customers.ai.service';
import { AppointmentsAiService } from '../appointments/appointments.ai.service';
import { AiActionsService } from '../ai-actions/ai-actions.service';
export declare class DebugController {
    private customersAi;
    private appointmentsAi;
    private aiActionsService;
    constructor(customersAi: CustomersAiService, appointmentsAi: AppointmentsAiService, aiActionsService: AiActionsService);
    aiAction(body: {
        type: 'customer' | 'appointment';
        payload: any;
    }): Promise<import("../customers/entities/customers.entity").Customer | import("../ai-actions/entities/ai-action.entity").AiAction | import("../appointments/entities/appointments.entity").Appointment | null>;
    getAiAction(requestId: string): Promise<import("../ai-actions/entities/ai-action.entity").AiAction | null>;
}
