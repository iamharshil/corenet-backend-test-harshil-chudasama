import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verifyUser(@Query('token') token: string) {
    const message = await this.authService.verifyUser(token);
    return { message };
  }

  @Get('business/verify')
  async verifyBusiness(@Query('token') token: string) {
    const message = await this.authService.verifyBusiness(token);
    return { message };
  }
}
