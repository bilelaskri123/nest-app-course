import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users.service';
import { UserType } from '../../utils/enums';
import { CURRENT_USER_KEY } from '../../utils/constants';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) {
      return false; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      return false; // No valid authorization header
    }

    try {
      const userPayload = await this.userService.verifyToken(token);
      if (!userPayload) {
        return false; // Invalid token
      }

      const user = await this.userService.findById(userPayload.id);
      if (!user) {
        return false; // User not found
      }
      request[CURRENT_USER_KEY] = userPayload;
      return roles.includes(user.userType);
    } catch (error) {
      return false; // Error during verification
    }
  }
}
