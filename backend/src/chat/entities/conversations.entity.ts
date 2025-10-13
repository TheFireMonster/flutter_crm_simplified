import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from '../entities/messages.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  linkId: string;

  @Column({ nullable: true })
  customerName: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  AIChatActive: boolean;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}