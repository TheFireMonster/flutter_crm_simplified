import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  handleConnection(client: Socket) {}
  handleDisconnect(client: Socket) {}

  @SubscribeMessage('send_message')
  async onMessage(@MessageBody() data, @ConnectedSocket() client: Socket) {
  }
}