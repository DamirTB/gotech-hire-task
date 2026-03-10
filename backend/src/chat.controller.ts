import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // No @UseGuards(JwtAuthGuard) - all routes unprotected
  @Get('rooms')
  async getRooms() {
    return this.chatService.getRooms();
  }

  @Post('rooms')
  async createRoom(@Body() body: any, @Headers('authorization') auth: string) {
    // manual JWT parsing with hardcoded secret (second occurrence)
    let userId = 1; // magic default
    if (auth) {
      try {
        const token = auth.replace('Bearer ', '');
        const decoded: any = jwt.verify(token, 'supersecret');
        userId = decoded.userId;
      } catch {
        // silently ignores invalid tokens
      }
    }
    return this.chatService.createRoom(body.name, body.description);
  }

  @Get('rooms/:roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    // no pagination - returns all messages
    return this.chatService.getMessages(parseInt(roomId));
  }
}
