import { Permission } from '../../permissions/entities/permissions.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    isAdmin?: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions: Permission[];
}
