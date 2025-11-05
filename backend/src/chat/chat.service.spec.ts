import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/messages.entity';
import { Conversation } from './entities/conversations.entity';
import { CustomerAudit } from '../customers/entities/customer-audit.entity';
import { CustomersService } from '../customers/customers.service';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepo: any;
  let conversationRepo: any;
  let customerAuditRepo: any;
  let customersService: any;

  beforeEach(async () => {
    messageRepo = {
      create: jest.fn().mockImplementation((data) => ({ ...data })),
      save: jest.fn().mockImplementation((msg) => Promise.resolve({ ...msg, id: '1' })),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    conversationRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    customerAuditRepo = {
      save: jest.fn(),
      create: jest.fn(),
    };

    customersService = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Message), useValue: messageRepo },
        { provide: getRepositoryToken(Conversation), useValue: conversationRepo },
        { provide: getRepositoryToken(CustomerAudit), useValue: customerAuditRepo },
        { provide: CustomersService, useValue: customersService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('saveMessage', () => {
    it('deve salvar mensagem do staff', async () => {
      const result = await service.saveMessage('conv1', 'staff', 'OlÃ¡, como posso ajudar?');

      expect(messageRepo.create).toHaveBeenCalledWith({
        conversation: { id: 'conv1' },
        sender: 'staff',
        content: 'OlÃ¡, como posso ajudar?',
      });
      expect(messageRepo.save).toHaveBeenCalled();
      expect(result).toEqual({
        conversation: { id: 'conv1' },
        sender: 'staff',
        content: 'OlÃ¡, como posso ajudar?',
        id: '1',
      });
    });

    it('deve salvar mensagem do customer', async () => {
      await service.saveMessage('conv2', 'customer', 'Preciso de ajuda com meu pedido');

      expect(messageRepo.create).toHaveBeenCalledWith({
        conversation: { id: 'conv2' },
        sender: 'customer',
        content: 'Preciso de ajuda com meu pedido',
      });
    });
  });

  describe('getRecentMessages', () => {
    it('deve retornar mensagens recentes ordenadas', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: '1', content: 'Mensagem 1' },
          { id: '2', content: 'Mensagem 2' },
        ]),
      };

      messageRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getRecentMessages('conv1', 20);

      expect(messageRepo.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('m.conversation', 'c');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('c.id = :id', { id: 'conv1' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('m.createdAt', 'ASC');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(2);
    });
  });

  describe('updateCustomerForConversation', () => {
    it('deve atualizar customer existente', async () => {
      const mockConv = { id: 'conv1', linkId: 'link1', customerId: 1 };
      const mockCustomer = { id: 1, name: 'JoÃ£o' };
      const updatedCustomer = { id: 1, name: 'JoÃ£o Silva' };

      conversationRepo.findOne.mockResolvedValue(mockConv);
      customersService.findOne.mockResolvedValue(mockCustomer);
      customersService.update.mockResolvedValue(updatedCustomer);

      const result = await service.updateCustomerForConversation('link1', { name: 'JoÃ£o Silva' });

      expect(conversationRepo.findOne).toHaveBeenCalledWith({ where: { linkId: 'link1' } });
      expect(customersService.update).toHaveBeenCalledWith(1, { name: 'JoÃ£o Silva' });
      expect(result).toEqual(updatedCustomer);
    });

    it('deve criar novo customer se conversation nÃ£o tem customerId', async () => {
      const mockConv = { id: 'conv1', linkId: 'link1', customerId: null };
      const newCustomer = { id: 2, name: 'Maria' };

      conversationRepo.findOne.mockResolvedValue(mockConv);
      customersService.create.mockResolvedValue(newCustomer);

      const result = await service.updateCustomerForConversation('link1', { name: 'Maria' });

      expect(customersService.create).toHaveBeenCalledWith({ name: 'Maria' });
      expect(conversationRepo.save).toHaveBeenCalledWith({ ...mockConv, customerId: 2 });
      expect(result).toEqual(newCustomer);
    });
  });
});
