import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;
}
