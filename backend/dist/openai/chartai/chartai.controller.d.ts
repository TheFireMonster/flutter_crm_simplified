import { ChartAIService } from './chartai.service';
import { PromptDto } from '../dto/prompt.dto';
export declare class ChartAIController {
    private readonly chartAIService;
    constructor(chartAIService: ChartAIService);
    generateChart(body: PromptDto): Promise<{
        error: string;
        chartType?: undefined;
        chartData?: undefined;
        meta?: undefined;
    } | {
        chartType: any;
        chartData: import("../../sales/entities/sales.entity").Sale[] | import("../../appointments/entities/appointments.entity").Appointment[] | import("../../customers/entities/customers.entity").Customer[] | import("../../services/entities/service.entity").Service[];
        meta: {
            table: "customers" | "sales" | "services" | "appointments";
            selectedFields: any;
            count: number;
        };
        error?: undefined;
    }>;
}
