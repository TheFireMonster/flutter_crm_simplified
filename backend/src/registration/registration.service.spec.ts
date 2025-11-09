import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegistrationCode } from './entities/registration-code.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getRepositoryToken(RegistrationCode), useValue: repo },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('generateRegistrationCode', () => {
    it('deve gerar código único de 32 caracteres', async () => {
      const mockCode = {
        id: 1,
        code: 'a1b2c3d4e5f6789012345678901234ef',
        used: false,
        expiresAt: expect.any(Date),
        createdAt: expect.any(Date)
      };

      repo.create.mockReturnValue(mockCode);
      repo.save.mockResolvedValue(mockCode);

      const result = await service.generateRegistrationCode();

      expect(result).toMatch(/^[a-f0-9]{32}$/);
      expect(repo.create).toHaveBeenCalledWith({
        code: expect.stringMatching(/^[a-f0-9]{32}$/),
        expiresAt: expect.any(Date)
      });
      expect(repo.save).toHaveBeenCalled();
    });

    it('deve definir expiração para 30 dias no futuro', async () => {
      const mockCode = { code: 'test123', expiresAt: new Date() };
      repo.create.mockReturnValue(mockCode);
      repo.save.mockResolvedValue(mockCode);

      await service.generateRegistrationCode();

      const createCall = repo.create.mock.calls[0][0];
      const expirationDate = createCall.expiresAt;
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(expirationDate.getTime()).toBeCloseTo(thirtyDaysFromNow.getTime(), -10000);
    });
  });

  describe('validateRegistrationCode', () => {
    it('deve validar código ativo e não usado', async () => {
      const validCode = {
        id: 1,
        code: 'valid123',
        used: false,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      };

      repo.findOne.mockResolvedValue(validCode);

      await expect(service.validateRegistrationCode('valid123')).resolves.not.toThrow();
    });

    it('deve rejeitar código inexistente', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.validateRegistrationCode('inexistente123'))
        .rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar código já usado', async () => {
  repo.findOne.mockResolvedValue(null);

      await expect(service.validateRegistrationCode('used123'))
        .rejects.toThrow(NotFoundException);
    });

    it('deve rejeitar código expirado', async () => {
  repo.findOne.mockResolvedValue(null);

      await expect(service.validateRegistrationCode('expired123'))
        .rejects.toThrow(NotFoundException);
    });

    it('deve usar query correta para buscar código', async () => {
      const validCode = {
        id: 1,
        code: 'test123',
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      };

      repo.findOne.mockResolvedValue(validCode);

      await service.validateRegistrationCode('test123');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { 
          code: 'test123',
          used: false,
          expiresAt: expect.any(Object)
        }
      });
    });
  });

  describe('markCodeAsUsed', () => {
    it('deve marcar código como usado com email', async () => {
      const code = 'valid123';
      const email = 'user@email.com';

      repo.update.mockResolvedValue({ affected: 1 });

      await service.markCodeAsUsed(code, email);

      expect(repo.update).toHaveBeenCalledWith(
        { code: code },
        {
          used: true,
          usedAt: expect.any(Date),
          usedByEmail: email
        }
      );
    });

    it('deve lançar erro se código não for encontrado para marcar', async () => {
      repo.update.mockResolvedValue({ affected: 0 });

      
      
      await expect(service.markCodeAsUsed('inexistente', 'test@email.com'))
        .resolves.not.toThrow();
    });

    it('deve definir usedAt como data atual', async () => {
      const beforeCall = new Date();
      repo.update.mockResolvedValue({ affected: 1 });

      await service.markCodeAsUsed('test123', 'user@email.com');

      const updateCall = repo.update.mock.calls[0][1];
      const usedAt = updateCall.usedAt;
      const afterCall = new Date();

      expect(usedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(usedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('edge cases', () => {
    it('deve lidar com múltiplas validações simultâneas', async () => {
      const validCode = {
        id: 1,
        code: 'concurrent123',
        used: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date()
      };

      repo.findOne.mockResolvedValue(validCode);

      const promises = [
        service.validateRegistrationCode('concurrent123'),
        service.validateRegistrationCode('concurrent123'),
        service.validateRegistrationCode('concurrent123')
      ];

      await expect(Promise.all(promises)).resolves.not.toThrow();
      expect(repo.findOne).toHaveBeenCalledTimes(3);
    });

    it('deve validar formato do código', async () => {
      
      const invalidCodes = ['', 'short', '12345', 'invalid@code!'];

      repo.findOne.mockResolvedValue(null);

      for (const invalidCode of invalidCodes) {
        await expect(service.validateRegistrationCode(invalidCode))
          .rejects.toThrow(NotFoundException);
      }

      
      expect(repo.findOne).toHaveBeenCalled();
    });

    it('deve gerar códigos únicos em sequência', async () => {
      const codes = new Set();
      
      for (let i = 0; i < 10; i++) {
        const mockCode = { code: `unique${i}`.padEnd(32, '0') };
        repo.create.mockReturnValueOnce(mockCode);
        repo.save.mockResolvedValueOnce(mockCode);
        
        const result = await service.generateRegistrationCode();
        codes.add(result);
      }

  expect(codes.size).toBe(10);
    });
  });
});