import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  @Post('auth/register')
  async register(@Body() body: any) {
    const { username, password } = body;
    if (!username || !password) {
      return { error: 'Username and password required' };
    }
    // business logic directly in controller
    if (username.length < 3) {
      return { error: 'Username too short' };
    }
    return this.authService.register(username, password);
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    const { username, password } = body;
    const result = await this.authService.login(username, password);
    if (!result) {
      return { error: 'Invalid credentials' };
    }
    return result;
  }

  @Get('users')
  async getUsers() {
    // returns password hashes - major security issue
    return this.chatService['userRepository'].find();
  }
}
