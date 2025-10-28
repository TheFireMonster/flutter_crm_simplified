import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_actions')
export class AiAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  requestId: string;

  @Column({ type: 'varchar' })
  actionType: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'varchar', nullable: true })
  resultTable?: string;

  @Column({ type: 'int', nullable: true })
  resultId?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
