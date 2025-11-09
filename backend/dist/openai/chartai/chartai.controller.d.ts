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
        chartData: import("../../sales/entities/sales.entity").Sale[] | import("../../customers/entities/customers.entity").Customer[] | import("../../appointments/entities/appointments.entity").Appointment[] | import("../../services/entities/service.entity").Service[];
        meta: {
            table: "sales" | "customers" | "appointments" | "services";
            selectedFields: any;
            count: number;
        };
        error?: undefined;
    }>;
}
