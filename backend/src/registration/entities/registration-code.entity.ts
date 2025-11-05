import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('registration_codes')
export class RegistrationCode {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 32, unique: true })
    code: string;

    @Column({ type: 'boolean', default: false })
    used: boolean;

    @Column({ type: 'timestamp', nullable: true })
    usedAt?: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    usedByEmail?: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}