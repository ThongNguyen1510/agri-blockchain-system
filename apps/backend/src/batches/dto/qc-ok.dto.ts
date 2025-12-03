import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class QcOkDto {
  @ApiProperty({ example: "Warehouse" })
  @IsString()
  @MaxLength(50)
  toRole!: string;

  @ApiProperty({ example: "Kho Bình Dương" })
  @IsString()
  @MaxLength(100)
  toName!: string;

  @ApiProperty({ example: "QC Team A" })
  @IsString()
  @MaxLength(100)
  inspector!: string;
}
