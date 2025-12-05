import { ApiProperty } from "@nestjs/swagger";
import type { Batch, Product, User } from "@prisma/client";
import { BatchDto } from "../../batches/dto/batch.dto";
import { UserDto } from "../../users/dto/user.dto";

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
  createdAt!: string;

  @ApiProperty({ type: () => UserDto, required: false, nullable: true })
  seller?: UserDto | null;

  @ApiProperty({ type: () => BatchDto, required: false, nullable: true })
  batch?: BatchDto | null;

  @ApiProperty({
    type: () => [Object],
    required: false,
    description: "Danh sách ảnh của sản phẩm",
  })
  images?: Array<{ id: number; url: string; sortOrder: number }>;

  static fromEntity(
    product: Product & {
      seller?: User | null;
      batch?: Batch | null;
      images?: Array<{ id: number; url: string; sortOrder: number }>;
    },
  ): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.priceWei = product.priceWei.toString();
    dto.stock = product.stock;
    dto.coverImageUrl = product.coverImageUrl;
    dto.batchId = product.batchId;
    dto.sellerId = product.sellerId;
    dto.createdAt = product.createdAt.toISOString();
    dto.seller = product.seller ? UserDto.fromEntity(product.seller) : null;
    dto.batch = product.batch ? BatchDto.fromEntity(product.batch) : null;
    if (product.images) {
      dto.images = product.images
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({ id: img.id, url: img.url, sortOrder: img.sortOrder }));
    }
    return dto;
  }
}
