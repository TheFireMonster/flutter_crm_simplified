import { AuthService } from './auth.service';
import { FirebaseRegisterDto } from './dto/firebase-register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    firebaseRegister(req: any, body: FirebaseRegisterDto): Promise<import("../users/entities/users.entity").User>;
    firebaseLogin(req: any): Promise<import("../users/entities/users.entity").User>;
    validateRegistrationCode(code: string): Promise<{
        valid: boolean;
        message: string;
        expiresAt: Date;
    }>;
}
