import { User } from '../../users/entities/users.entity';
export declare class Permission {
    id: number;
    name: string;
    description: string;
    isActive?: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
