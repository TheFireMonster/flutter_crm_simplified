import { Repository } from 'typeorm';
import { Sale } from './entities/sales.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesService {
    private readonly saleRepository;
    constructor(saleRepository: Repository<Sale>);
    create(createSaleDto: CreateSaleDto): Promise<Sale>;
    findAll(): Promise<Sale[]>;
    findOne(id: number): Promise<Sale>;
    update(id: number, updateDto: Partial<CreateSaleDto>): Promise<Sale>;
    remove(id: number): Promise<void>;
}
