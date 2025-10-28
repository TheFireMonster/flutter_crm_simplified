import { CustomersService } from './customers.service';
import { Customer } from './entities/customers.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(body: CreateCustomerDto): Promise<Customer>;
    findAll(): Promise<Customer[]>;
    search(): Promise<Customer[]>;
    export(): Promise<Customer[]>;
    findOne(id: string): Promise<Customer>;
    update(id: string, body: CreateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
