import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
// Permission import removed for simple Firebase login
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  // Permissions repository removed for simple Firebase login
    private readonly jwtService: JwtService,
  ) {}

  // Registro e login agora são feitos via Firebase
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

    return this.createToken(user);
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

    return this.createToken(user);
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userRepo.findOne({
      where: { refreshToken },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    user.refreshToken = newRefreshToken;
    await this.userRepo.save(user);

    return this.createToken(user);
  }

  createToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return {
      token: this.jwtService.sign(payload),
      expiry: Date.now() + 3600 * 1000,
      refresh_token: user.refreshToken,
    };
  }
}