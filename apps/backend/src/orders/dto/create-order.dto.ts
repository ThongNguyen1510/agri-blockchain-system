import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingAddress?: string;
}