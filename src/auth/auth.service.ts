import { randomUUID } from 'node:crypto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createVerifyToken(
    id: number,
    email: string,
    type: 'user' | 'business',
  ) {
    const token = randomUUID();
    const value = jwt.sign({ id, email, type }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
    await this.prisma.token.create({ data: { token, value } });
    return { token, value };
  }

  async getVerifyTokenData(token: string) {
    if (!token) {
      throw new NotFoundException('This verification link is not valid');
    }
    const row = await this.prisma.token.findFirst({ where: { token } });
    if (!row) {
      throw new NotFoundException('This verification link is not valid');
    }
    try {
      const data = jwt.verify(row.value, process.env.JWT_SECRET!);
      return data as { id: number; email: string; type: string };
    } catch {
      throw new UnauthorizedException('This verification link is expired');
    }
  }

  async verifyUser(token: string) {
    const data = await this.getVerifyTokenData(token);
    if (data.type !== 'user') {
      throw new NotFoundException('This verification link is not valid');
    }
    await this.prisma.user.update({
      where: { id: data.id },
      data: { status: 'ACTIVE' },
    });
    await this.prisma.token.deleteMany({ where: { token } });
    return 'Email verified, you can login now';
  }

  async verifyBusiness(token: string) {
    const data = await this.getVerifyTokenData(token);
    if (data.type !== 'business') {
      throw new NotFoundException('This verification link is not valid');
    }
    await this.prisma.business.update({
      where: { id: data.id },
      data: { status: 'ACTIVE' },
    });
    await this.prisma.token.deleteMany({ where: { token } });
    return 'Email verified, you can login now';
  }
}
