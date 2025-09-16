import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/users.entity';
import { Permission } from '../permissions/entities/permissions.entity';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
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
      relations: ['permissions'],
    });

    if (!user) {
      const defaultPerm = await this.permRepo.findOne({ where: { name: 'user' } });
      user = this.userRepo.create({
        email: decoded.email,
        name: name || decoded.name || '',
        permissions: defaultPerm ? [defaultPerm] : [],
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
      relations: ['permissions'],
    });

    if (!user) {
      const defaultPerm = await this.permRepo.findOne({ where: { name: 'user' } });
      user = this.userRepo.create({
        email: decoded.email,
        name: decoded.name || '',
        permissions: defaultPerm ? [defaultPerm] : [],
        refreshToken: crypto.randomBytes(32).toString('hex'),
      });
      await this.userRepo.save(user);
    }

    return this.createToken(user);
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userRepo.findOne({
      where: { refreshToken },
      relations: ['permissions'],
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
      roles: user.permissions.map(p => p.name),
    };
    return {
      token: this.jwtService.sign(payload),
      expiry: Date.now() + 3600 * 1000,
      refresh_token: user.refreshToken,
      roles: payload.roles,
    };
  }
}