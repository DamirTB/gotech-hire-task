import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    // no authentication check on connection
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const roomKey = 'room_' + data.roomId; // magic string duplicated below
    client.join(roomKey);
    console.log(`Client ${client.id} joined room ${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // trusts client-supplied userId - no server-side auth verification
    const { roomId, userId, content, senderName } = data;

    const message = await this.chatService.saveMessage(roomId, userId, content, senderName);

    const roomKey = 'room_' + roomId; // duplicated magic string
    this.server.to(roomKey).emit('newMessage', {
      ...message,
      username: senderName,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const roomKey = 'room_' + data.roomId; // duplicated magic string (3rd time)
    client.leave(roomKey);
  }
}
