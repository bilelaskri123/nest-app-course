import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const query = request.query;
    console.log(
      `Incoming Request: ${method} ${url} with query ${JSON.stringify(query)}`,
    );
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `Request ${method} ${url} handled in ${Date.now() - now}ms with status ${response.statusCode}`,
          ),
        ),
      );
  }
}
