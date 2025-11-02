import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";

export class UpdateProductDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  batchId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  priceWei?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImageUrl?: string;
}
