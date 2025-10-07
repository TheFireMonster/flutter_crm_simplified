import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsServices } from './entities/products_services.entity';
import { CreateProductsServicesDto } from './dto/create-products_services.dto';

@Injectable()
export class ProductsServicesService {
  constructor(
    @InjectRepository(ProductsServices)
    private readonly productsServicesRepository: Repository<ProductsServices>,
  ) {}

  async create(createDto: CreateProductsServicesDto): Promise<ProductsServices> {
    const item = this.productsServicesRepository.create(createDto);
    return this.productsServicesRepository.save(item);
  }

  async findAll(): Promise<ProductsServices[]> {
    return this.productsServicesRepository.find();
  }
}
