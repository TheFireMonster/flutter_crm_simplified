import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Sale } from '../../sales/entities/sales.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
    cpf: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    address?: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth?: Date;

    @Column({ type: 'varchar', length: 2, nullable: true })
    state?: string;

    @Column({ type: 'varchar', length: 9, nullable: true })
    cep?: string;

    @Column({ type: 'varchar', nullable: true, length: 50 })
    source?: string;

}