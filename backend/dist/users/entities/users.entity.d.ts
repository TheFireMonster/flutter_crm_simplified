export declare class User {
    id: number;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    isAdmin?: boolean;
    refreshToken?: string;
    refreshTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}
