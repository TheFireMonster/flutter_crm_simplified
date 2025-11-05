export declare class RegistrationCode {
    id: number;
    code: string;
    used: boolean;
    usedAt?: Date;
    usedByEmail?: string;
    expiresAt: Date;
    createdAt: Date;
}
