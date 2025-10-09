import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "./user-role.enum";

interface CreateUserPayload {
  email: string;
  passwordHash: string;
  role: UserRole;
  walletAddress: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateUserPayload): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: payload.email.toLowerCase(),
          passwordHash: payload.passwordHash,
          role: payload.role,
          walletAddress: payload.walletAddress,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Email already registered");
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (error && typeof error === "object" && "code" in error) {
      return (error as { code?: string }).code === "P2002";
    }
    return false;
  }
}