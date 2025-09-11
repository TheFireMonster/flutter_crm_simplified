import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Cliente ou funcionário entra na conversa
  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  // Envio de mensagem
  @SubscribeMessage('send_message')
  async onMessage(
    @MessageBody() data: { conversationId: string; sender: 'client' | 'staff'; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Buscar a conversa pelo linkId
    const conversation = await this.conversationRepo.findOne({ where: { linkId: data.conversationId } });
    if (!conversation) {
      console.log('Conversation not found:', data.conversationId);
      return;
    }

    // Salvar mensagem no banco
    const savedMessage = await this.chatService.saveMessage(
      conversation.id,
      data.sender,
      data.text,
    );

    // Emitir somente para a sala da conversa
    this.server.to(data.conversationId).emit('receive_message', savedMessage);
  }
}