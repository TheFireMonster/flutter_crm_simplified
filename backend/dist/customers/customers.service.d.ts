import { Repository } from 'typeorm';
import { Customer } from './entities/customers.entity';
export declare class CustomersService {
    private customersRepository;
    constructor(customersRepository: Repository<Customer>);
    create(customerData: Partial<Customer>): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    findOne(id: number): Promise<Customer>;
    update(id: number, updateData: Partial<Customer>): Promise<Customer>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
