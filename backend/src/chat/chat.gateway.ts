
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
    // Log for troubleshooting in production (Render) so we can confirm the event
    // reaches the server and which socket connection sent it.
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`typing event from client ${client.id} for conversation ${data.conversationId} sender=${data.sender}`);
      }
    } catch (_) {}

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
      // Notify the room that customer data changed
      this.server.to(data.conversationId).emit('customer_updated', updated);
    } catch (err) {
      console.error('handleUpdateCustomer error', err);
    }
  }

  handleConnection(client: Socket) {
    // Log handshake details to help diagnose production issues (origins, auth)
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔗 Socket.IO client connected:', client.id, 'from', client.handshake.address);
      }
    } catch (_) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔗 Socket.IO client connected:', client.id);
      }
    }
  }

  handleDisconnect(client: Socket) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('❌ Socket.IO client disconnected:', client.id, 'from', client.handshake.address);
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Client ${client.id} joined conversation ${conversationId}`);
    }
  }

  @SubscribeMessage('send_message')
  async onMessage(
    @MessageBody() data: { conversationId: string; sender: 'client' | 'staff'; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.conversationRepo.findOne({ where: { linkId: data.conversationId } });
    if (!conversation) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Conversation not found:', data.conversationId);
      }
      return;
    }

    const savedMessage = await this.chatService.saveMessage(
      conversation.id,
      data.sender,
      data.text,
    );

  // Emit the saved message to the conversation room. This will deliver to
  // all joined clients (including the sender), so emitting directly to the
  // client as well caused duplicates.
  this.server.to(data.conversationId).emit('receive_message', savedMessage);

    console.error(`onMessage: conversation ${conversation.linkId} AIChatActive=${conversation.AIChatActive}`);
    if (conversation.AIChatActive) {
      console.error('onMessage: AI is active, calling ask (non-streaming)...');
      // Notify clients the AI is 'typing' (simple indicator).
      try {
        this.server.to(data.conversationId).emit('typing', { sender: 'staff' });
      } catch (_) {}

      // Call the simpler synchronous completion method. It will include
      // recent history and customerName when available (handled inside service).
      const AIChatReply = await this.aiChatService.ask(
        data.text,
        conversation.id,
        conversation.customerName || undefined,
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