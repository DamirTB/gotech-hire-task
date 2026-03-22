import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

export interface AuthenticatedUser {
  userId: number;
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    const token = authHeader.slice(7);
    const decoded = this.authService.verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request.user = decoded;
    return true;
  }
}
