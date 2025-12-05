import { CreateUserDto } from "../../users/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto extends CreateUserDto {
  @ApiProperty({ description: "Tên hiển thị", maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  displayName!: string;

  @ApiProperty({ required: false, description: "Số điện thoại", maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ required: false, description: "Địa chỉ", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}

