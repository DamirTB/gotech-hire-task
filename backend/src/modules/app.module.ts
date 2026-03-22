import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../controllers/app.controller';
import { ChatController } from '../controllers/chat.controller';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { ChatGateway } from '../gateways/chat.gateway';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'chatdb',
      entities: [User, Room, Message],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Room, Message]),
  ],
  controllers: [AppController, ChatController],
  providers: [AuthService, ChatService, ChatGateway],
})
export class AppModule {}
