import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { RegistrationService } from '../registration/registration.service';
export declare class AuthService {
    private readonly userRepo;
    private readonly registrationService;
    constructor(userRepo: Repository<User>, registrationService: RegistrationService);
    firebaseRegister(idToken: string, name?: string): Promise<User>;
    firebaseLogin(idToken: string): Promise<User>;
    validateRegistrationCode(code: string): Promise<{
        valid: boolean;
        message: string;
        expiresAt: Date;
    }>;
}
