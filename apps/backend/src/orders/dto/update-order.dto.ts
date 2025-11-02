import { IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from "class-validator";

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingAddress?: string;
}
