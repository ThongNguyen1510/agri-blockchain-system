import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  priceWei: string; // Since BigInt in Prisma

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsNotEmpty()
  @IsString()
  batchId: string;

  @IsNotEmpty()
  @IsString()
  sellerId: string;
}
