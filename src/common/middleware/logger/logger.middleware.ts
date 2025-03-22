import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const method = req.method;
      const url = req.originalUrl;
      const status = res.statusCode;

      const user = req.user as
        | { userId: string; username: string; role: string }
        | undefined;
      const userInfo = user ? `[user: ${user.username} - ${user.userId}]` : '';

      console.log(`[${method}] ${url} -> ${status} +${duration}ms ${userInfo}`);
    });

    next();
  }
}
