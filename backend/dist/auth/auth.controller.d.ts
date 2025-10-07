import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    firebaseRegister(req: any, body: {
        name?: string;
    }): Promise<import("../users/entities/users.entity").User>;
    firebaseLogin(req: any): Promise<import("../users/entities/users.entity").User>;
}
