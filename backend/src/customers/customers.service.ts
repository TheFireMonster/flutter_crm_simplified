import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customers.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) {}
    
    create(customerData: Partial<Customer>) {
        const customer = this.customersRepository.create(customerData);
        return this.customersRepository.save(customer);
    }
    
    findAll() {
        return this.customersRepository.find();
    }
    
    async findOne(id: number): Promise<Customer> {
        const customer = await this.customersRepository.findOneBy({ id });
        if (!customer) {
            throw new NotFoundException(`Cliente do ID ${id} não encontrado`);
        }
        return customer;
    }
    
    async update(id: number, updateData: Partial<Customer>) {
        await this.customersRepository.update(id, updateData);
        return this.findOne(id);
    }
    
    async remove(id: number) {
        const result = await this.customersRepository.delete({ id });
        if (result.affected === 0) {
            throw new NotFoundException(`Cliente do ID ${id} não encontrado`);
        }
        return this.customersRepository.delete(id);
    }
}
