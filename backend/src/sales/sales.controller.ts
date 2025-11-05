
import { Controller, Post, Body, Get, Put, Delete, Param, HttpCode } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sales.entity';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  async findAll(): Promise<Sale[]> {
    return this.salesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Sale> {
    return this.salesService.findOne(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateSaleDto>): Promise<Sale> {
    return this.salesService.update(Number(id), updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.salesService.remove(Number(id));
  }
}
