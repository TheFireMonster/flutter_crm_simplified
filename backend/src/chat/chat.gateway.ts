
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AIChatService } from '../openai/aichat/aichat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    
    this.server.to(data.conversationId).emit('typing', {
      sender: data.sender,
      conversationId: data.conversationId,
      ts: Date.now(),
    });
  }
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly aiChatService: AIChatService,
  ) {}

  @SubscribeMessage('update_customer')
  async handleUpdateCustomer(
    @MessageBody() data: { conversationId: string; update: Record<string, any> },
    @ConnectedSocket() client: Socket,
  ) {
    try {
  const updated = await this.chatService.updateCustomerForConversation(data.conversationId, data.update, client.id);
      this.server.to(data.conversationId).emit('customer_updated', updated);
    } catch (err) {
      console.error('handleUpdateCustomer error', err);
    }
  }

  handleConnection(client: Socket) {
    
  }

  handleDisconnect(client: Socket) {
    
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    
  }

  @SubscribeMessage('send_message')
  async onMessage(
    @MessageBody() data: { conversationId: string; sender: 'client' | 'staff'; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.conversationRepo.findOne({ where: { linkId: data.conversationId } });
    if (!conversation) {
      return;
    }

    const savedMessage = await this.chatService.saveMessage(
      conversation.id,
      data.sender,
      data.text,
    );

  this.server.to(data.conversationId).emit('receive_message', savedMessage);

    console.error(`onMessage: conversation ${conversation.linkId} AIChatActive=${conversation.AIChatActive}`);
    if (conversation.AIChatActive) {
      console.error('onMessage: AI is active, calling ask (non-streaming)...');
      try {
        this.server.to(data.conversationId).emit('typing', { sender: 'staff' });
      } catch (_) {}
      
      const AIChatReply = await this.aiChatService.ask(
        data.text,
        conversation.id,
        conversation.customerName || undefined,
        conversation.customerId || undefined,
      );

      try {
        this.server.to(data.conversationId).emit('typing', { sender: 'staff', done: true });
      } catch (_) {}

      console.error('onMessage: ask returned, saving bot message');
      const botMessage = await this.chatService.saveMessage(
        conversation.id,
        'AIChat',
        AIChatReply,
      );
      console.error('onMessage: saved botMessage, emitting to room');
      this.server.to(data.conversationId).emit('receive_message', botMessage);
    }
  }
}