import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointments.entity';
import { Customer } from '../../customers/entities/customers.entity';
import { Service } from '../../services/entities/service.entity';
import { Sale } from '../../sales/entities/sales.entity';
export declare class ChartAIService {
    private readonly httpService;
    private readonly configService;
    private readonly appointmentRepo;
    private readonly customerRepo;
    private readonly saleRepo;
    private readonly serviceRepo;
    constructor(httpService: HttpService, configService: ConfigService, appointmentRepo: Repository<Appointment>, customerRepo: Repository<Customer>, saleRepo: Repository<Sale>, serviceRepo: Repository<Service>);
    generateChart(prompt: string): Promise<{
        error: string;
        chartType?: undefined;
        chartData?: undefined;
        meta?: undefined;
    } | {
        chartType: any;
        chartData: Appointment[] | Customer[] | Service[] | Sale[];
        meta: {
            table: "customers" | "appointments" | "services" | "sales";
            selectedFields: any;
            count: number;
        };
        error?: undefined;
    }>;
}
