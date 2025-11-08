import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RegistrationCode } from './entities/registration-code.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(RegistrationCode)
    private registrationCodeRepository: Repository<RegistrationCode>,
  ) {}

  async generateRegistrationCode(): Promise<string> {
    const code = randomBytes(16).toString('hex');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const registrationCode = this.registrationCodeRepository.create({
      code,
      expiresAt,
    });

    await this.registrationCodeRepository.save(registrationCode);
    
    return code;
  }

  async validateRegistrationCode(code: string): Promise<RegistrationCode> {
    const registrationCode = await this.registrationCodeRepository.findOne({
      where: {
        code,
        used: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!registrationCode) {
      throw new NotFoundException('Código de registro inválido ou expirado');
    }

    return registrationCode;
  }

  async markCodeAsUsed(code: string, email: string): Promise<void> {
    await this.registrationCodeRepository.update(
      { code },
      {
        used: true,
        usedAt: new Date(),
        usedByEmail: email,
      }
    );
  }
}