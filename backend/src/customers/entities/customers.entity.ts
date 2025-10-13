import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 11 })
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

/*     @Column({ type: 'jsonb', nullable: true })
    customAttributes: {
        industry?: string;
        companySize?: 'small' | 'medium' | 'large';
        lastPurchase?: Date;
        preferences?: string[];
    }; */ // Uncomment if needed

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}