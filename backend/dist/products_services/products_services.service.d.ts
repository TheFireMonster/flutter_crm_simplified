import { Repository } from 'typeorm';
import { ProductsServices } from './entities/products_services.entity';
import { CreateProductsServicesDto } from './dto/create-products_services.dto';
export declare class ProductsServicesService {
    private readonly productsServicesRepository;
    constructor(productsServicesRepository: Repository<ProductsServices>);
    create(createDto: CreateProductsServicesDto): Promise<ProductsServices>;
    findAll(): Promise<ProductsServices[]>;
}
