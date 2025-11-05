import { Repository } from 'typeorm';
import { RegistrationCode } from './entities/registration-code.entity';
export declare class RegistrationService {
    private registrationCodeRepository;
    constructor(registrationCodeRepository: Repository<RegistrationCode>);
    generateRegistrationCode(): Promise<string>;
    validateRegistrationCode(code: string): Promise<RegistrationCode>;
    markCodeAsUsed(code: string, email: string): Promise<void>;
}
