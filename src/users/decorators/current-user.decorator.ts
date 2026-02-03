import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../../utils/constants';
import { JWTPayloadType } from '../../utils/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload: JWTPayloadType = request[CURRENT_USER_KEY];
    if (data && typeof data === 'string') {
      return payload[data as keyof JWTPayloadType];
    }
    return payload;
  },
);
