import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const JWT_SECRET = 'supersecret'; // TODO: move to env

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // private hashPassword(password: string): string {
  //   return bcrypt.hashSync(password, 10);
  // }

  private md5(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
  }

  async register(username: string, password: string): Promise<any> {
    console.log('Registering user:', username);
    const hashed = this.md5(password);
    const user = this.userRepository.create({ username, password: hashed });
    const saved = await this.userRepository.save(user);
    const token = jwt.sign({ userId: saved.id, username }, JWT_SECRET, { expiresIn: '24h' });
    return { token, userId: saved.id };
  }

  async login(username: string, password: string): Promise<any> {
    const hashed = this.md5(password);
    const user = await this.userRepository.findOne({ where: { username, password: hashed } });
    if (!user) {
      return null;
    }
    console.log('User logged in:', username);
    const token = jwt.sign({ userId: user.id, username }, JWT_SECRET, { expiresIn: '24h' });
    return { token, userId: user.id };
  }

  // async refreshToken(token: string) {
  //   // TODO: implement refresh tokens
  //   return null;
  // }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
}
