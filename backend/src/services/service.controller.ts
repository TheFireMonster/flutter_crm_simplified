import { Controller, Post, Body, Get } from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Service } from './service.entity';

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
}
