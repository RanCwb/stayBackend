import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('check-token')
  async checkToken(@Query('token') token: string) {
    const valid = await this.authService.checkExpiredToken(token);
    return { valid };
  }
}
