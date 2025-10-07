import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProductsServicesService } from '../products_services/products_services.service';
import { AppointmentsService } from '../appointments/appointments.service';
export declare class ChatGptService {
    private readonly httpService;
    private readonly configService;
    private readonly productsServicesService;
    private readonly appointmentsService;
    constructor(httpService: HttpService, configService: ConfigService, productsServicesService: ProductsServicesService, appointmentsService: AppointmentsService);
    ask(prompt: string): Promise<string>;
}
