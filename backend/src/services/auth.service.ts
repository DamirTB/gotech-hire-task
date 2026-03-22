import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  private comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  async register(
    username: string,
    password: string,
  ): Promise<{ token: string; userId: number }> {
    const existing = await this.userRepository.findOne({ where: { username } });
    if (existing) {
      throw new ConflictException('Username already taken');
    }
    const hashed = this.hashPassword(password);
    const user = this.userRepository.create({ username, password: hashed });
    const saved = await this.userRepository.save(user);
    const token = jwt.sign({ userId: saved.id, username }, JWT_SECRET, {
      expiresIn: '24h',
    });
    return { token, userId: saved.id };
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; userId: number } | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !this.comparePassword(password, user.password)) {
      return null;
    }
    const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, {
      expiresIn: '24h',
    });
    return { token, userId: user.id };
  }

  verifyToken(token: string): { userId: number; username: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
      };
    } catch {
      return null;
    }
  }
}
