import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('customer_reports')
export class CustomerReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    customerName: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    customerEmail: string;

    @Column({ type: 'text' })
    reportDetails: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}