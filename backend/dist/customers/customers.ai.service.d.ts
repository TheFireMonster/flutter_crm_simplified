import { CustomersService } from './customers.service';
import { CreateCustomerFromAiDto } from './dto/create-customer-from-ai.dto';
import { AiActionsService } from '../ai-actions/ai-actions.service';
export declare class CustomersAiService {
    private customersService;
    private aiActionsService;
    constructor(customersService: CustomersService, aiActionsService: AiActionsService);
    createFromAi(dto: CreateCustomerFromAiDto): Promise<import("./entities/customers.entity").Customer | import("../ai-actions/entities/ai-action.entity").AiAction | null>;
}
