import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { BusinessModule } from './business/business.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SlotModule } from './slot/slot.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, BusinessModule, SlotModule],
})
export class AppModule {}
