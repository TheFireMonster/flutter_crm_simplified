import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { RegistrationService } from '../registration/registration.service';
import { randomBytes } from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly registrationService: RegistrationService,
  ) {}

  async firebaseRegister(idToken: string, name?: string, registrationCode?: string) {
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    if (registrationCode) {
      await this.registrationService.validateRegistrationCode(registrationCode);
    }

    let user = await this.userRepo.findOne({
      where: { email: decoded.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: decoded.email,
        name: name || decoded.name || '',
        refreshToken: randomBytes(32).toString('hex'),
      });
      await this.userRepo.save(user);
      
      // Mark registration code as used if provided
      if (registrationCode) {
        await this.registrationService.markCodeAsUsed(registrationCode, decoded.email);
      }
    }

  return user;
  }

  async firebaseLogin(idToken: string) {
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    let user = await this.userRepo.findOne({
      where: { email: decoded.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: decoded.email,
        name: decoded.name || '',
        refreshToken: randomBytes(32).toString('hex'),
      });
      await this.userRepo.save(user);
    }

  return user;
  }

  async validateRegistrationCode(code: string) {
    const registrationCode = await this.registrationService.validateRegistrationCode(code);
    return { 
      valid: true,
      message: 'Código válido. Você pode se registrar.',
      expiresAt: registrationCode.expiresAt
    };
  }

}