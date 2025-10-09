import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { UserRole } from "../user-role.enum";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 72)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  walletAddress!: string;
}