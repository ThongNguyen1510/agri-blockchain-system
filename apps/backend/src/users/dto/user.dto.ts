import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { UserRole } from "../user-role.enum";

export class UserDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  walletAddress!: string;

  @ApiProperty({ required: false, nullable: true })
  displayName?: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  address?: string | null;

  @ApiProperty({ required: false, nullable: true })
  taxId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  businessLicense?: string | null;

  @ApiProperty({ required: false, default: false })
  kycVerified?: boolean;

  @ApiProperty({ required: false, nullable: true })
  kycNote?: string | null;

  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role as UserRole;
    dto.walletAddress = user.walletAddress;
    // Optional profile/KYC fields
    dto.displayName = (user as any).displayName ?? null;
    dto.phone = (user as any).phone ?? null;
    dto.address = (user as any).address ?? null;
    dto.taxId = (user as any).taxId ?? null;
    dto.businessLicense = (user as any).businessLicense ?? null;
    dto.kycVerified = Boolean((user as any).kycVerified ?? false);
    dto.kycNote = (user as any).kycNote ?? null;
    return dto;
  }
}