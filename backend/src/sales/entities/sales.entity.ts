import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    productName: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    saleDate: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    customerName?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    customerEmail?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}