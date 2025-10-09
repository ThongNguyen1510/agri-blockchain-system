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

  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role as UserRole;
    dto.walletAddress = user.walletAddress;
    return dto;
  }
}