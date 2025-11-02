import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserDto } from "./dto/user.dto";
import { WalletUpdateNonceResponseDto, UpdateWalletDto } from "./dto/update-wallet.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getProfile(@CurrentUser() user: CurrentUserType): UserDto {
    return UserDto.fromEntity(user as any);
  }

  // Tạo nonce để người dùng ký bằng ví CŨ khi muốn đổi ví
  @Post("wallet-update-nonce")
  getWalletUpdateNonce(@CurrentUser() user: CurrentUserType): WalletUpdateNonceResponseDto {
    const nonce = this.usersService.issueWalletUpdateNonce(user.id);
    return { nonce };
  }

  // Cập nhật ví: yêu cầu chữ ký từ ví cũ (xác minh), kiểm tra không có đơn IN_ESCROW, rồi ghi audit
  @Post("update-wallet")
  async updateWallet(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateWalletDto,
  ): Promise<UserDto> {
    const updated = await this.usersService.updateWallet(user.id, dto);
    return UserDto.fromEntity(updated);
  }
}