import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "./user-role.enum";
import { UpdateWalletDto } from "./dto/update-wallet.dto";
import { ethers } from "ethers";

interface CreateUserPayload {
  email: string;
  passwordHash: string;
  role: UserRole;
  walletAddress: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Bộ nhớ tạm lưu nonce cập nhật ví. Nên thay bằng Redis/DB nếu scale.
  private walletUpdateNonces = new Map<number, { nonce: string; expiresAt: number }>();

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

  async updatePassword(userId: number, newPasswordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (error && typeof error === "object" && "code" in error) {
      return (error as { code?: string }).code === "P2002";
    }
    return false;
  }

  // Phát hành nonce để user ký bằng ví CŨ
  issueWalletUpdateNonce(userId: number): string {
    const nonce = `WALLET_UPDATE:${userId}:${Math.random().toString(36).slice(2)}:${Date.now()}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút
    this.walletUpdateNonces.set(userId, { nonce, expiresAt });
    return nonce;
  }

  // Cập nhật địa chỉ ví: yêu cầu chữ ký từ ví cũ, không có đơn đang IN_ESCROW
  async updateWallet(userId: number, dto: UpdateWalletDto): Promise<User> {
    const user = await this.findById(userId);

    // Không cho đổi ví nếu có đơn đang ký quỹ
    const heldCount = await this.prisma.order.count({ where: { buyerId: userId, status: "IN_ESCROW" } });
    if (heldCount > 0) {
      throw new BadRequestException("Không thể đổi ví khi đang có đơn ký quỹ");
    }

    const saved = this.walletUpdateNonces.get(userId);
    if (!saved) throw new BadRequestException("Nonce không tồn tại. Vui lòng lấy nonce mới.");
    if (Date.now() > saved.expiresAt) {
      this.walletUpdateNonces.delete(userId);
      throw new BadRequestException("Nonce đã hết hạn. Vui lòng lấy nonce mới.");
    }

    // Verify chữ ký bằng ví CŨ
    let recovered: string;
    try {
      recovered = ethers.verifyMessage(saved.nonce, dto.signature);
    } catch {
      throw new BadRequestException("Chữ ký không hợp lệ");
    }
    if (recovered.toLowerCase() !== user.walletAddress.toLowerCase()) {
      throw new BadRequestException("Chữ ký không khớp với ví hiện tại");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress: dto.newWallet },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "USER_WALLET_UPDATED",
        metadataJson: JSON.stringify({ oldWallet: user.walletAddress, newWallet: dto.newWallet, method: "signature" }),
      },
    });

    this.walletUpdateNonces.delete(userId);

    return updated;
  }
}