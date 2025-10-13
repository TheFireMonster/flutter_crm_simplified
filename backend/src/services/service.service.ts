import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createDto: CreateServiceDto): Promise<Service> {
    const item = this.serviceRepository.create(createDto);
    return this.serviceRepository.save(item);
  }

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find();
  }
}
