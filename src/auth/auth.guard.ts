import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

type TokenData = { id: number; email: string; type: string };

export type RequestWithUser = Request & { user?: TokenData };

@Injectable()
export class BusinessAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const header = req.headers.authorization;
    if (!header) {
      throw new UnauthorizedException('Please login first');
    }
    const token = header.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Please login first');
    }
    let data: TokenData;
    try {
      data = jwt.verify(token, process.env.JWT_SECRET!) as TokenData;
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
    if (data.type !== 'business') {
      throw new UnauthorizedException('This route is only for business owners');
    }
    req.user = data;
    return true;
  }
}
