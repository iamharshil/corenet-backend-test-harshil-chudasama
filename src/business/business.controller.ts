import { Body, Controller, Post } from '@nestjs/common';
import { LoginBusinessDto, RegisterBusinessDto } from './business.dto.js';
import { BusinessService } from './business.service.js';

@Controller('auth/business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('register')
  register(@Body() dto: RegisterBusinessDto) {
    return this.businessService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginBusinessDto) {
    return this.businessService.login(dto);
  }
}
