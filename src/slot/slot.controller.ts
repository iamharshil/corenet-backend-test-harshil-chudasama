import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, Matches, Min } from 'class-validator';
import { SlotService } from './slot.service.js';

export class SlotQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  businessId: number;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId: number;
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date: string;
}

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Get()
  getSlots(@Query() query: SlotQueryDto) {
    return this.slotService.getSlots(
      query.businessId,
      query.serviceId,
      query.date,
    );
  }
}
