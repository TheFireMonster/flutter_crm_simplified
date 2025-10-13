import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  serviceName: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerEmail?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
