import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { User } from '../../users/entities/users.entity';
import { ManyToMany } from "typeorm/decorator/relations/ManyToMany";

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    description: string;

    @Column({ type: 'boolean', default: false })
    isActive?: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToMany(() => User, user => user.permissions)
    users: User[];
}