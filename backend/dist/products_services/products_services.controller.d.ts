import { ProductsServicesService } from './products_services.service';
import { CreateProductsServicesDto } from './dto/create-products_services.dto';
import { ProductsServices } from './entities/products_services.entity';
export declare class ProductsServicesController {
    private readonly service;
    constructor(service: ProductsServicesService);
    create(createDto: CreateProductsServicesDto): Promise<ProductsServices>;
    findAll(): Promise<ProductsServices[]>;
}
