import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: this.jwt.sign(payload),
      payload,
    };
  }

  async checkExpiredToken(token: string) {
    try {
      const payload = this.jwt.decode(token);
      const { exp } = payload;
      const dateNow = Date.now() / 1000;
      if (exp < dateNow) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  generateToken(payload: { sub: string; email: string; role: string }) {
    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
