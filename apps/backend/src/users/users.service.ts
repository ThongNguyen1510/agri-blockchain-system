import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash: hashedPassword,
        role: createUserDto.role ?? 'buyer',
        walletAddress: createUserDto.walletAddress || '',
      },
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const hashedPassword = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, 10)
      : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        passwordHash: hashedPassword || undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
