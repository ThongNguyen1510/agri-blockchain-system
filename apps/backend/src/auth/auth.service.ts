import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(registerDto: RegisterDto) {
  try {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Kiểm tra email tồn tại trước
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    });
    
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }
    
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        role: registerDto.role || 'buyer',
        walletAddress: registerDto.walletAddress || '',
      },
    });
    
    const { passwordHash, ...result } = user;
    return result;
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    throw error;
  }
}
}
