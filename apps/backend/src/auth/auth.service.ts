import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/user-role.enum";
import { UserDto } from "../users/dto/user.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.assertRoleAllowed(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      role: dto.role,
      walletAddress: dto.walletAddress,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildAuthResponse(user);
  }

  async validateUserById(userId: string): Promise<User> {
    const numericId = Number(userId);
    if (Number.isNaN(numericId)) {
      throw new UnauthorizedException("Invalid token");
    }
    return this.usersService.findById(numericId);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role as UserRole,
    };

    const response = new AuthResponseDto();
    response.accessToken = this.jwtService.sign(payload);
    response.user = UserDto.fromEntity(user);
    return response;
  }

  private assertRoleAllowed(role: UserRole): void {
    const allowedRoles: UserRole[] = [UserRole.Seller, UserRole.Buyer];
    if (!allowedRoles.includes(role)) {
      throw new UnauthorizedException("Role not allowed for self-registration");
    }
  }
}