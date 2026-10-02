import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginUserDto, RegisterUserDto } from './user.dto.js';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(dto: RegisterUserDto) {
    const alreadyExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (alreadyExists) {
      throw new ConflictException('User with this email already exists');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password,
      },
    });
    const verifyToken = await this.authService.createVerifyToken(
      user.id,
      user.email,
      'user',
    );
    console.log(
      `verify user email: ${process.env.APP_URL}/auth/verify?token=${verifyToken.token}`,
    );
    return {
      message: 'User registered successfully, please verify your email',
      ...verifyToken,
    };
  }

  async login(dto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const isPasswordCorrect = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Please verify your email first');
    }
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    };
  }
}
