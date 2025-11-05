import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  async create(@Body() createDto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(createDto);
  }

  @Get()
  async findAll(): Promise<Service[]> {
    return this.serviceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Service> {
    return this.serviceService.findOne(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateServiceDto>): Promise<Service> {
    return this.serviceService.update(Number(id), updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.serviceService.remove(Number(id));
  }
}
