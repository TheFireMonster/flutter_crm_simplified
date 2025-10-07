import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsServicesController } from './products_services.controller';
import { ProductsServicesService } from './products_services.service';
import { ProductsServices } from './entities/products_services.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ProductsServices])],
  controllers: [ProductsServicesController],
  providers: [ProductsServicesService],
  exports: [ProductsServicesService],
})
export class ProductsServicesModule {}
