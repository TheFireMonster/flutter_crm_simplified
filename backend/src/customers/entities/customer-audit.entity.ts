import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('customer_audit')
export class CustomerAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  customerId?: number;

  @Column({ nullable: true })
  conversationLinkId?: string;

  @Column({ nullable: true })
  changedBy?: string;

  
  @Column({ type: 'json', nullable: true })
  changes?: any;

  @CreateDateColumn()
  createdAt: Date;
}
