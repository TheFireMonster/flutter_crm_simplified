import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AIChatService } from '../openai/aichat/aichat.service';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  const chatServiceMock = { saveMessage: jest.fn() };
  const aiChatMock = { askStream: jest.fn() };
  const repoMock = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: chatServiceMock },
        { provide: AIChatService, useValue: aiChatMock },
        { provide: getRepositoryToken(Conversation), useValue: repoMock },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    // mock server
    gateway.server = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
  });

  afterEach(() => jest.clearAllMocks());

  it('should emit typing events on handleTyping', () => {
    const client: any = { id: 'c1' };
    const data = { conversationId: 'link1', sender: 'client' };
    gateway.handleTyping(data, client);
    expect((gateway.server.to as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });

  it('should save and emit messages and call AI when active', async () => {
    repoMock.findOne.mockResolvedValue({ id: 'conv1', linkId: 'link1', AIChatActive: true });
    chatServiceMock.saveMessage.mockResolvedValue({ id: 'm1', content: 'hi' });
    aiChatMock.askStream.mockResolvedValue('AI reply');
    chatServiceMock.saveMessage.mockResolvedValueOnce({ id: 'm1', content: 'hi' }).mockResolvedValueOnce({ id: 'm2', content: 'AI reply' });

    const client: any = { id: 'c1', handshake: { address: 'addr' } };
    await gateway.onMessage({ conversationId: 'link1', sender: 'client', text: 'hello' }, client);

    expect(repoMock.findOne).toHaveBeenCalled();
    expect(chatServiceMock.saveMessage).toHaveBeenCalled();
    expect(aiChatMock.askStream).toHaveBeenCalledWith('link1', 'hello', gateway.server);
    // ensure AI message emitted
    expect((gateway.server.emit as jest.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
