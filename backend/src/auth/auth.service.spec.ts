import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { RegistrationService } from '../registration/registration.service';
import { UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';


jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let registrationService: any;
  let mockAuth: any;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    registrationService = {
      validateRegistrationCode: jest.fn(),
      markCodeAsUsed: jest.fn(),
    };

    mockAuth = {
      verifyIdToken: jest.fn(),
    };

    (admin.auth as jest.Mock).mockReturnValue(mockAuth);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: RegistrationService, useValue: registrationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('firebaseRegister', () => {
    const mockDecodedToken = {
      email: 'test@example.com',
      name: 'Test User',
      uid: 'firebase-uid-123',
    };

    it('deve registrar um novo usuário com token válido', async () => {
      const idToken = 'valid-token';
      const name = 'John Doe';

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      userRepo.findOne.mockResolvedValue(null);
      
      const newUser = {
        id: 1,
        email: mockDecodedToken.email,
        name,
        refreshToken: 'generated-token',
      };
      
      userRepo.create.mockReturnValue(newUser);
      userRepo.save.mockResolvedValue(newUser);

      const result = await service.firebaseRegister(idToken, name);

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: mockDecodedToken.email },
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        email: mockDecodedToken.email,
        name,
        refreshToken: expect.any(String),
      });
      expect(result).toEqual(newUser);
    });

    it('deve retornar usuário existente', async () => {
      const idToken = 'valid-token';
      const existingUser = {
        id: 1,
        email: mockDecodedToken.email,
        name: 'Existing User',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      userRepo.findOne.mockResolvedValue(existingUser);

      const result = await service.firebaseRegister(idToken);

      expect(userRepo.create).not.toHaveBeenCalled();
      expect(userRepo.save).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it('deve lançar UnauthorizedException para token inválido', async () => {
      const invalidToken = 'invalid-token';

      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token inválido'));

      await expect(service.firebaseRegister(invalidToken))
        .rejects.toThrow(UnauthorizedException);
      
      expect(userRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('firebaseLogin', () => {
    const mockDecodedToken = {
      email: 'user@example.com',
      name: 'Login User',
      uid: 'firebase-uid-456',
    };

    it('deve fazer login de usuário existente', async () => {
      const idToken = 'valid-token';
      const existingUser = {
        id: 1,
        email: mockDecodedToken.email,
        name: 'Existing User',
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      userRepo.findOne.mockResolvedValue(existingUser);

      const result = await service.firebaseLogin(idToken);

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(idToken);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: mockDecodedToken.email },
      });
      expect(result).toEqual(existingUser);
    });

    it('deve lançar UnauthorizedException para token inválido', async () => {
      const invalidToken = 'invalid-token';

      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token inválido'));

      await expect(service.firebaseLogin(invalidToken))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateRegistrationCode', () => {
    it('deve validar código de registro', async () => {
      const code = 'valid-code';
      const mockRegistrationCode = {
        id: 1,
        code,
        expiresAt: new Date('2025-12-31'),
        used: false,
      };

      registrationService.validateRegistrationCode.mockResolvedValue(mockRegistrationCode);

      const result = await service.validateRegistrationCode(code);

      expect(registrationService.validateRegistrationCode).toHaveBeenCalledWith(code);
      expect(result).toEqual({
        valid: true,
        message: 'Código válido. Você pode se registrar.',
        expiresAt: mockRegistrationCode.expiresAt,
      });
    });
  });
});
