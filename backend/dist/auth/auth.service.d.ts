import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
export declare class AuthService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    firebaseRegister(idToken: string, name?: string): Promise<User>;
    firebaseLogin(idToken: string): Promise<User>;
}
