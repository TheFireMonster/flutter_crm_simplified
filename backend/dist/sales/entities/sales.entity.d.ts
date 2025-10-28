import { Customer } from '../../customers/entities/customers.entity';
export declare class Sale {
    id: number;
    serviceName: string;
    price: number;
    saleDate: Date;
    customerName?: string;
    customerEmail?: string;
    customerId?: number;
    customer?: Customer;
    updatedAt: Date;
}
