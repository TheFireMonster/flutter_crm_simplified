import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
export declare class ServiceService {
    private readonly serviceRepository;
    constructor(serviceRepository: Repository<Service>);
    create(createDto: CreateServiceDto): Promise<Service>;
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    update(id: number, updateDto: Partial<CreateServiceDto>): Promise<Service>;
    remove(id: number): Promise<void>;
}
