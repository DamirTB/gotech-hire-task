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
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';

interface AuthenticatedSocket extends Socket {
  user?: { userId: number; username: string };
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
  ) {}

  private getRoomKey(roomId: number): string {
    return `room_${roomId}`;
  }

  handleConnection(client: AuthenticatedSocket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }
    const decoded = this.authService.verifyToken(token);
    if (!decoded) {
      client.emit('error', { message: 'Invalid token' });
      client.disconnect();
      return;
    }
    client.user = decoded;
    console.log(`Client ${client.id} authenticated as ${decoded.username}`);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;
    client.join(this.getRoomKey(data.roomId));
    console.log(
      `Client ${client.id} joined room ${data.roomId}`,
    );
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { roomId: number; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }
    const { roomId, content } = data;
    const message = await this.chatService.saveMessage(
      roomId,
      client.user.userId,
      content,
    );

    this.server.to(this.getRoomKey(roomId)).emit('newMessage', message);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(this.getRoomKey(data.roomId));
  }
}
