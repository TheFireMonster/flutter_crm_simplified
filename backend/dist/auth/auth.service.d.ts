import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { Permission } from '../permissions/entities/permissions.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly permRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, permRepo: Repository<Permission>, jwtService: JwtService);
    firebaseRegister(idToken: string, name?: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
    firebaseLogin(idToken: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
    createToken(user: User): {
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    };
}
