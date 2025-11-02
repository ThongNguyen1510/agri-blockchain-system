import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/user-role.enum";
import { UserDto } from "../users/dto/user.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Không tiết lộ email có tồn tại hay không (security best practice)
      return { message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu." };
    }

    // Xóa các token cũ chưa dùng của user này
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Tạo token ngẫu nhiên
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    // Lưu token vào database
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Gửi email
    await this.emailService.sendPasswordResetEmail(user.email, token);

    return {
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Tìm token trong database
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã được sử dụng.");
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException("Token đã hết hạn.");
    }

    // Cập nhật mật khẩu
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(tokenRecord.userId, newPasswordHash);

    // Đánh dấu token đã sử dụng
    await this.prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    return { message: "Mật khẩu đã được đặt lại thành công." };
  }

  private assertRoleAllowed(role: UserRole): void {
    const allowedRoles: UserRole[] = [UserRole.Seller, UserRole.Buyer];
    if (!allowedRoles.includes(role)) {
      throw new UnauthorizedException("Role not allowed for self-registration");
    }
  }
}