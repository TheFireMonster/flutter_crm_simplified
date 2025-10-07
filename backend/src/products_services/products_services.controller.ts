import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProductsServicesService } from './products_services.service';
import { CreateProductsServicesDto } from './dto/create-products_services.dto';
import { ProductsServices } from './entities/products_services.entity';

@Controller('products-services')
export class ProductsServicesController {
  constructor(private readonly service: ProductsServicesService) {}

  @Post()
  async create(@Body() createDto: CreateProductsServicesDto): Promise<ProductsServices> {
    return this.service.create(createDto);
  }

  @Get()
  async findAll(): Promise<ProductsServices[]> {
    return this.service.findAll();
  }
}
