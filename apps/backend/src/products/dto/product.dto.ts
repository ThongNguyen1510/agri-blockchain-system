import { ApiProperty } from "@nestjs/swagger";
import { Product } from "@prisma/client";

export class ProductDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty()
  priceWei!: string;

  @ApiProperty()
  stock!: number;

  @ApiProperty({ required: false, nullable: true })
  coverImageUrl?: string | null;

  @ApiProperty()
  batchId!: number;

  @ApiProperty()
  sellerId!: number;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(product: Product): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.priceWei = product.priceWei.toString();
    dto.stock = product.stock;
    dto.coverImageUrl = product.coverImageUrl;
    dto.batchId = product.batchId;
    dto.sellerId = product.sellerId;
    dto.createdAt = product.createdAt;
    return dto;
  }
}