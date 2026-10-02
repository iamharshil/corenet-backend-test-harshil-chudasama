import { Module } from '@nestjs/common';
import { BusinessAuthGuard } from '../auth/auth.guard.js';
import { AuthModule } from '../auth/auth.module.js';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';
import { ManageController } from './manage.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [BusinessController, ManageController],
  providers: [BusinessService, BusinessAuthGuard],
})
export class BusinessModule {}
