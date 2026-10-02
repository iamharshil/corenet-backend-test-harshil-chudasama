import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BusinessAuthGuard, type RequestWithUser } from '../auth/auth.guard.js';
import {
  CreateAvailabilityDto,
  CreateServiceDto,
  UpdateProfileDto,
} from './business.dto.js';
import { BusinessService } from './business.service.js';

@UseGuards(BusinessAuthGuard)
@Controller('business')
export class ManageController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('me')
  getProfile(@Req() req: RequestWithUser) {
    return this.businessService.getProfile(req.user!.id);
  }

  @Patch('me')
  updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.businessService.updateProfile(req.user!.id, dto);
  }

  @Post('services')
  createService(@Req() req: RequestWithUser, @Body() dto: CreateServiceDto) {
    return this.businessService.createService(req.user!.id, dto);
  }

  @Get('services')
  getServices(@Req() req: RequestWithUser) {
    return this.businessService.getServices(req.user!.id);
  }

  @Patch('services/:id')
  updateService(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateServiceDto,
  ) {
    return this.businessService.updateService(req.user!.id, id, dto);
  }

  @Delete('services/:id')
  deleteService(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.businessService.deleteService(req.user!.id, id);
  }

  @Post('availabilities')
  createAvailability(
    @Req() req: RequestWithUser,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.businessService.createAvailability(req.user!.id, dto);
  }

  @Get('availabilities')
  getAvailabilities(@Req() req: RequestWithUser) {
    return this.businessService.getAvailabilities(req.user!.id);
  }

  @Delete('availabilities/:id')
  deleteAvailability(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.businessService.deleteAvailability(req.user!.id, id);
  }
}
