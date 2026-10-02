import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service.js';
import type {
  Service,
  WeeklyAvailability,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateAvailabilityDto,
  CreateServiceDto,
  LoginBusinessDto,
  RegisterBusinessDto,
  UpdateProfileDto,
} from './business.dto.js';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(dto: RegisterBusinessDto) {
    const alreadyExists = await this.prisma.business.findUnique({
      where: { email: dto.email },
    });
    if (alreadyExists) {
      throw new ConflictException('Business with this email already exists');
    }
    const mobileExists = await this.prisma.business.findUnique({
      where: { mobile: dto.mobile },
    });
    if (mobileExists) {
      throw new ConflictException('Business with this mobile already exists');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const business = await this.prisma.business.create({
      data: {
        name: dto.name,
        email: dto.email,
        mobile: dto.mobile,
        password,
      },
    });
    const verifyToken = await this.authService.createVerifyToken(
      business.id,
      business.email,
      'business',
    );
    console.log(
      `verify business email: ${process.env.APP_URL}/auth/business/verify?token=${verifyToken.token}`,
    );
    return {
      message: 'Business registered successfully, please verify your email',
      ...verifyToken,
    };
  }

  async login(dto: LoginBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { email: dto.email },
    });
    if (!business) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    const isPasswordCorrect = await bcrypt.compare(
      dto.password,
      business.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Email or password is wrong');
    }
    if (business.status !== 'ACTIVE') {
      throw new UnauthorizedException('Please verify your email first');
    }
    const accessToken = jwt.sign(
      { id: business.id, email: business.email, type: 'business' },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' },
    );
    return {
      accessToken,
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        mobile: business.mobile,
        status: business.status,
      },
    };
  }

  async getProfile(businessId: number) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return {
      id: business.id,
      name: business.name,
      email: business.email,
      mobile: business.mobile,
      status: business.status,
    };
  }

  async updateProfile(businessId: number, dto: UpdateProfileDto) {
    const mobileTaken = await this.prisma.business.findFirst({
      where: { mobile: dto.mobile, NOT: { id: businessId } },
    });
    if (mobileTaken) {
      throw new ConflictException('This mobile is already used');
    }
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: { name: dto.name, mobile: dto.mobile },
    });
    return { id: business.id, name: business.name, mobile: business.mobile };
  }

  async createService(businessId: number, dto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
        businessId,
        status: 'ACTIVE',
      },
    });
    return this.toService(service);
  }

  async getServices(businessId: number) {
    const services = await this.prisma.service.findMany({
      where: { businessId },
      orderBy: { id: 'asc' },
    });
    return services.map((service) => this.toService(service));
  }

  async updateService(businessId: number, id: number, dto: CreateServiceDto) {
    await this.getOwnService(businessId, id);
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        duration: dto.duration,
        price: dto.price,
      },
    });
    return this.toService(service);
  }

  async deleteService(businessId: number, id: number) {
    await this.getOwnService(businessId, id);
    await this.prisma.service.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
    return { message: 'Service removed' };
  }

  private async getOwnService(businessId: number, id: number) {
    const service = await this.prisma.service.findFirst({
      where: { id, businessId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  private toService(service: Service) {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: Number(service.price),
      status: service.status,
    };
  }

  async createAvailability(businessId: number, dto: CreateAvailabilityDto) {
    if (dto.startsAt >= dto.endsAt) {
      throw new BadRequestException('startsAt must be before endsAt');
    }
    const alreadyExists = await this.prisma.weeklyAvailability.findFirst({
      where: { businessId, day: dto.day, startsAt: dto.startsAt },
    });
    if (alreadyExists) {
      throw new ConflictException('This time window is already added');
    }
    const availability = await this.prisma.weeklyAvailability.create({
      data: {
        day: dto.day,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        businessId,
      },
    });
    return this.toAvailability(availability);
  }

  async getAvailabilities(businessId: number) {
    const rows = await this.prisma.weeklyAvailability.findMany({
      where: { businessId },
      orderBy: [{ day: 'asc' }, { startsAt: 'asc' }],
    });
    return rows.map((row) => this.toAvailability(row));
  }

  async deleteAvailability(businessId: number, id: number) {
    const row = await this.prisma.weeklyAvailability.findFirst({
      where: { id, businessId },
    });
    if (!row) {
      throw new NotFoundException('Availability not found');
    }
    await this.prisma.weeklyAvailability.delete({ where: { id } });
    return { message: 'Availability removed' };
  }

  private toAvailability(row: WeeklyAvailability) {
    return {
      id: row.id,
      day: row.day,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
    };
  }
}
