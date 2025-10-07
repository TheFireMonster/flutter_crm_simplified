import { Repository } from 'typeorm';
import { Sale } from './entities/sales.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
export declare class SalesService {
    private readonly saleRepository;
    constructor(saleRepository: Repository<Sale>);
    create(createSaleDto: CreateSaleDto): Promise<Sale>;
    findAll(): Promise<Sale[]>;
}
