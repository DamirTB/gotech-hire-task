import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ChatController } from './chat.controller';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { User } from './entities/user.entity';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'chatdb',
      entities: [User, Room, Message],
      synchronize: true, // never use in production
    }),
    TypeOrmModule.forFeature([User, Room, Message]),
  ],
  controllers: [AppController, ChatController],
  providers: [AuthService, ChatService, ChatGateway],
})
export class AppModule {}
