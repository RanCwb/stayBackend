import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/admin.dto';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(dto: CreateAdminDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const emailExists = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    })

    if (emailExists) {
      throw new UnauthorizedException('Email already exists.');
    }

    try {
      const admin = await this.prisma.admin.create({
        data: {
          email: dto.email,
          password: hashed,
          role: dto.role,
        },
      });
      const token = this.authService.generateToken({
        sub: admin.id,
        email: admin.email,
        role: admin.role,
      });
      return { admin, token };
    } catch (error) {
      console.error('[AdminService]', error);
      throw new InternalServerErrorException('error creating admin.');
    }
  }

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.authService.generateToken(payload);

    const { password, ...adminSemSenha } = admin;

    return {
      token: (await token).access_token,
      admin: adminSemSenha,
    };
  }
}
