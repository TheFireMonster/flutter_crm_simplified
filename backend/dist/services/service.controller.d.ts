import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './entities/service.entity';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(createDto: CreateServiceDto): Promise<Service>;
    findAll(): Promise<Service[]>;
}
