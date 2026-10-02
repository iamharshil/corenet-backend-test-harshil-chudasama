import { Module } from '@nestjs/common';
import { SlotController } from './slot.controller.js';
import { SlotService } from './slot.service.js';

@Module({
  controllers: [SlotController],
  providers: [SlotService],
})
export class SlotModule {}
