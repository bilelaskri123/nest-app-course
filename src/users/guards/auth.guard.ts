import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    try {
      const payload = await this.usersService.verifyToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid or missing token');
      }
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or missing token');
    }
  }
}
