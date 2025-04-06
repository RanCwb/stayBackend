import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('signup')
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  @Post('login')
  async login(@Body() dto: CreateAdminDto) {
    return this.adminService.login(dto);
  }
}
