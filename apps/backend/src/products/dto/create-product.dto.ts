import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";

export class CreateProductDto {
  @IsInt()
  @Min(1)
  batchId!: number;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  priceWei!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImageUrl?: string;
}

