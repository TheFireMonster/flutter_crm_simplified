import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ManyToMany} from "typeorm/decorator/relations/ManyToMany";
import { JoinTable } from "typeorm/decorator/relations/JoinTable";
import { Permission } from '../../permissions/entities/permissions.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password?: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ type: 'boolean', default: false})
    isAdmin?: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refreshToken?: string;

    @Column({ type: 'timestamp', nullable: true })
    refreshTokenExpiry?: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToMany(() => Permission, permission => permission.users)
    @JoinTable({
        name: 'user_permissions',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];
}