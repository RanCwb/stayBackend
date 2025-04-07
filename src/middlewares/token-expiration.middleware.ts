import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TokenExpirationMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {

    console.log('TokenExpirationMiddleware......');

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not found.');
    }

    const token = authHeader.split(' ')[1];

    const isValid = await this.authService.checkExpiredToken(token);

    if (!isValid) {
      throw new UnauthorizedException('Token expired.');
    }

    next();
  }
}
