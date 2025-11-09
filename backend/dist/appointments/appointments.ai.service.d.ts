import { CreateAppointmentFromAiDto } from './dto/create-appointment-from-ai.dto';
import { AiActionsService } from '../ai-actions/ai-actions.service';
import { AppointmentsService } from './appointments.service';
import { CustomersService } from '../customers/customers.service';
export declare class AppointmentsAiService {
    private aiActionsService;
    private appointmentsService;
    private customersService;
    constructor(aiActionsService: AiActionsService, appointmentsService: AppointmentsService, customersService: CustomersService);
    createFromAi(dto: CreateAppointmentFromAiDto): Promise<import("../ai-actions/entities/ai-action.entity").AiAction | import("./entities/appointments.entity").Appointment | null>;
}
