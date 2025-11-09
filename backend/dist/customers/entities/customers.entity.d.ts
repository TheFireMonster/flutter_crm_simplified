import { Sale } from '../../sales/entities/sales.entity';
export declare class Customer {
    id: number;
    name: string;
    email: string;
    cpf: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    state?: string;
    cep?: string;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
    sales?: Sale[];
}
