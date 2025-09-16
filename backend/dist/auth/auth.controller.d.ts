import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    firebaseRegister(req: any, body: {
        name?: string;
    }): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
    firebaseLogin(req: any): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
    refreshToken(body: {
        refresh_token: string;
    }): Promise<{
        token: string;
        expiry: number;
        refresh_token: string | undefined;
        roles: string[];
    }>;
}
