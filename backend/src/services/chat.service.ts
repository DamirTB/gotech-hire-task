import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getRooms(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  async createRoom(
    name: string,
    description: string | undefined,
    createdBy: number,
  ): Promise<Room> {
    const existing = await this.roomRepository.findOne({ where: { name } });
    if (existing) {
      return existing;
    }
    const room = this.roomRepository.create({ name, description, createdBy });
    return this.roomRepository.save(room);
  }

  async getMessages(
    roomId: number,
    page = 1,
    limit = 50,
  ): Promise<
    {
      id: number;
      content: string;
      user_id: number;
      room_id: number;
      createdAt: Date;
      username: string;
    }[]
  > {
    const messages = await this.messageRepository.find({
      where: { room_id: roomId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      user_id: msg.user_id,
      room_id: msg.room_id,
      createdAt: msg.createdAt,
      username: msg.user?.username || 'unknown',
    }));
  }

  async saveMessage(
    roomId: number,
    userId: number,
    content: string,
  ): Promise<{
    id: number;
    content: string;
    user_id: number;
    room_id: number;
    createdAt: Date;
    username: string;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const message = this.messageRepository.create({
      room_id: roomId,
      user_id: userId,
      content,
    });
    const saved = await this.messageRepository.save(message);
    return {
      id: saved.id,
      content: saved.content,
      user_id: saved.user_id,
      room_id: saved.room_id,
      createdAt: saved.createdAt,
      username: user?.username || 'unknown',
    };
  }

  async getUserById(
    id: number,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async getUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async deleteMessage(messageId: number, userId: number): Promise<boolean> {
    const msg = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (!msg) return false;
    if (msg.user_id !== userId) return false;
    await this.messageRepository.delete(messageId);
    return true;
  }
}
