import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
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

  async findOne(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }
    return service;
  }

  async update(id: number, updateDto: Partial<CreateServiceDto>): Promise<Service> {
    await this.serviceRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Serviço com ID ${id} não encontrado`);
    }
  }
}
