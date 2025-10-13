import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation } from './entities/conversations.entity';
import { Message } from './entities/messages.entity';

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
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update conversation', async () => {
    const conv = { linkId: 'abc', customerName: 'Old', AIChatActive: false };
    conversationRepo.findOne.mockResolvedValue(conv);
    conversationRepo.save.mockResolvedValue({ ...conv, customerName: 'New', AIChatActive: true });
    const result = await controller.updateConversation('abc', { customerName: 'New', AIChatActive: true });
    expect(result).toEqual({ success: true, customerName: 'New', AIChatActive: true });
    expect(conversationRepo.save).toHaveBeenCalled();
  });

  it('should return error if conversation not found', async () => {
    conversationRepo.findOne.mockResolvedValue(undefined);
    const result = await controller.updateConversation('notfound', { customerName: 'New' });
    expect(result).toEqual({ error: 'Conversation not found' });
  });

  it('should create conversation', async () => {
    const conv = { linkId: 'uuid', customerName: 'Cliente' };
    conversationRepo.create.mockReturnValue(conv);
    conversationRepo.save.mockResolvedValue(conv);
    const result = await controller.createConversation('Cliente');
    expect(result).toEqual({ linkId: 'uuid', url: 'http://localhost:3000/chat/uuid' });
    expect(conversationRepo.create).toHaveBeenCalledWith({ linkId: expect.any(String), customerName: 'Cliente' });
    expect(conversationRepo.save).toHaveBeenCalled();
  });

  it('should get message history', async () => {
    messageRepo.find.mockResolvedValue([{ content: 'msg1' }, { content: 'msg2' }]);
    const result = await controller.getHistory('abc');
    expect(result).toEqual([{ content: 'msg1' }, { content: 'msg2' }]);
    expect(messageRepo.find).toHaveBeenCalledWith({
      where: { conversation: { linkId: 'abc' } },
      order: { createdAt: 'ASC' },
      relations: ['conversation'],
    });
  });
});
