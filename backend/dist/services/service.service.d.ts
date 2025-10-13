import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
export declare class ServiceService {
    private readonly serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    create(createDto: CreateServiceDto): Promise<Service>;
    findAll(): Promise<Service[]>;
}
