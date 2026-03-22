import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard, AuthenticatedUser } from '../guards/jwt-auth.guard';
import { CreateRoomDto } from '../dto/create-room.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms')
  async getRooms() {
    return this.chatService.getRooms();
  }

  @Post('rooms')
  async createRoom(
    @Body() body: CreateRoomDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.chatService.createRoom(
      body.name,
      body.description,
      req.user.userId,
    );
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getMessages(roomId, page, limit);
  }
}
