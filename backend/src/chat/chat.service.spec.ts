import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from './entities/messages.entity';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepo: any;

  beforeEach(async () => {
    messageRepo = {
      create: jest.fn().mockImplementation((data) => ({ ...data })),
      save: jest.fn().mockImplementation((msg) => Promise.resolve({ ...msg, id: '1' })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepo,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save a message', async () => {
    const result = await service.saveMessage('conv1', 'staff', 'Hello!');
    expect(messageRepo.create).toHaveBeenCalledWith({
      conversation: { id: 'conv1' },
      sender: 'staff',
      content: 'Hello!',
    });
    expect(messageRepo.save).toHaveBeenCalled();
    expect(result).toEqual({
      conversation: { id: 'conv1' },
      sender: 'staff',
      content: 'Hello!',
      id: '1',
    });
  });
});
