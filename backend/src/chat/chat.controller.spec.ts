import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';
import { CustomersService } from '../customers/customers.service';

describe('ChatController', () => {
  let controller: ChatController;
  let conversationRepo: any;
  let messageRepo: any;

  beforeEach(async () => {
    conversationRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    messageRepo = {
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: getRepositoryToken(Conversation), useValue: conversationRepo },
        { provide: getRepositoryToken(Message), useValue: messageRepo },
        { provide: CustomersService, useValue: { findOrCreateCustomer: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve atualizar conversa', async () => {
    const conv = { linkId: 'abc', customerName: 'Old', AIChatActive: false };
    conversationRepo.findOne.mockResolvedValue(conv);
    conversationRepo.save.mockResolvedValue({ ...conv, customerName: 'New', AIChatActive: true });
    const result = await controller.updateConversation('abc', { customerName: 'New', AIChatActive: true });
    expect(result).toEqual({ success: true, customerName: 'New', AIChatActive: true });
    expect(conversationRepo.save).toHaveBeenCalled();
  });

  it('deve retornar erro se conversa não encontrada', async () => {
    conversationRepo.findOne.mockResolvedValue(undefined);
    const result = await controller.updateConversation('notfound', { customerName: 'New' });
    expect(result).toEqual({ error: 'Conversation not found' });
  });

  it('deve criar conversa', async () => {
    const conv = { linkId: 'uuid', customerName: 'Cliente', accessToken: '3912d8f9' };
    conversationRepo.create.mockReturnValue(conv);
    conversationRepo.save.mockResolvedValue(conv);
  const result = await controller.createConversation({ customerName: 'Cliente' });
  expect(result.linkId).toBe('uuid');
  expect(result.url).toEqual(expect.stringContaining('/chat/uuid'));
    expect(conversationRepo.create).toHaveBeenCalledWith({ linkId: expect.any(String), customerName: 'Cliente', accessToken: expect.any(String) });
    expect(conversationRepo.save).toHaveBeenCalled();
  });

  it('deve obter histórico de mensagens', async () => {
    conversationRepo.findOne.mockResolvedValue({ linkId: 'abc', id: 'conv1', accessToken: 'token123' });
    messageRepo.find.mockResolvedValue([{ content: 'msg1' }, { content: 'msg2' }]);
    const result = await controller.getHistory('abc', 'token123');
    expect(result).toEqual([{ content: 'msg1' }, { content: 'msg2' }]);
    expect(messageRepo.find).toHaveBeenCalledWith({
      where: { conversation: { linkId: 'abc' } },
      order: { createdAt: 'ASC' },
      relations: ['conversation'],
    });
  });
});
