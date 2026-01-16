import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or missing token');
    }
  }
}
