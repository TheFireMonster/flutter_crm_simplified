
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatGptService } from '../ai-agents/chatgpt.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: string; sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.conversationId).emit('typing', {
      sender: data.sender,
    });
  }
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly chatGptService: ChatGptService,
  ) {}

  handleConnection(client: Socket) {
    console.log('🔗 Socket.IO client connected:', client.id, 'from', client.handshake.address);
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Socket.IO client disconnected:', client.id, 'from', client.handshake.address);
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  @SubscribeMessage('send_message')
  async onMessage(
    @MessageBody() data: { conversationId: string; sender: 'client' | 'staff'; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const conversation = await this.conversationRepo.findOne({ where: { linkId: data.conversationId } });
    if (!conversation) {
      console.log('Conversation not found:', data.conversationId);
      return;
    }

    const savedMessage = await this.chatService.saveMessage(
      conversation.id,
      data.sender,
      data.text,
    );

    this.server.to(data.conversationId).emit('receive_message', savedMessage);
    client.emit('receive_message', savedMessage);

    // If ChatGPT is active, route message to ChatGPT and emit bot response
    if (conversation.chatGptActive) {
      const gptReply = await this.chatGptService.ask(data.text);
      const botMessage = await this.chatService.saveMessage(
        conversation.id,
        'chatgpt',
        gptReply,
      );
      this.server.to(data.conversationId).emit('receive_message', botMessage);
    }
  }
}