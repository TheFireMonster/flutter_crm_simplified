import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sales.entity';
export declare class SalesController {
    private readonly salesService;
    constructor(salesService: SalesService);
    create(createSaleDto: CreateSaleDto): Promise<Sale>;
    findAll(): Promise<Sale[]>;
    findOne(id: string): Promise<Sale>;
    update(id: string, updateDto: Partial<CreateSaleDto>): Promise<Sale>;
    remove(id: string): Promise<void>;
}
