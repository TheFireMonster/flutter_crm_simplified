import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    firebaseRegister(idToken: string, name?: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
    }>;
    firebaseLogin(idToken: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
    }>;
    refreshToken(refreshToken: string): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
    }>;
    createToken(user: User): {
        token: string;
        expiry: number;
        refresh_token: string | undefined;
    };
}
