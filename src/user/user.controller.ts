import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './user.dto.js';
import { UserService } from './user.service.js';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.userService.login(dto);
  }
}
