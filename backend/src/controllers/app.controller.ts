import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard, AuthenticatedUser } from '../guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  @Post('auth/register')
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body.username, body.password);
  }

  @Post('auth/login')
  async login(@Body() body: CreateUserDto) {
    const result = await this.authService.login(body.username, body.password);
    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers() {
    return this.chatService.getUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  async getCurrentUser(@Req() req: { user: AuthenticatedUser }) {
    return this.chatService.getUserById(req.user.userId);
  }
}
