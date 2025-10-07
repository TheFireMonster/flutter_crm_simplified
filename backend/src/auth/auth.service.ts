import { Injectable, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

  ) {}

  async firebaseRegister(idToken: string, name?: string) {
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
        name: name || decoded.name || '',
        refreshToken: crypto.randomBytes(32).toString('hex'),
      });
      await this.userRepo.save(user);
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
        refreshToken: crypto.randomBytes(32).toString('hex'),
      });
      await this.userRepo.save(user);
    }

  return user;
  }




}