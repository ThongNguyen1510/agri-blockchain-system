import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, MaxLength, Min } from "class-validator";

export class TransportUpdateDto {
  @ApiProperty({ example: "Kho Bình Dương → Cửa hàng Q1" })
  @IsString()
  @MaxLength(100)
  location!: string;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  @Min(-50)
  temperature!: number;
}
