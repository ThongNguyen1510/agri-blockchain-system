import { ApiProperty } from "@nestjs/swagger";
import type { Order, Product } from "@prisma/client";
import { OrderStatus } from "../order-status.enum";

export class OrderProductSummaryDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  priceWei!: string;

  static fromEntity(product: Product): OrderProductSummaryDto {
    const dto = new OrderProductSummaryDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.priceWei = product.priceWei.toString();
    return dto;
  }
}

export class OrderDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  productId!: number;

  @ApiProperty({ type: () => OrderProductSummaryDto, required: false, nullable: true })
  product?: OrderProductSummaryDto | null;

  @ApiProperty()
  buyerId!: number;

  @ApiProperty()
  sellerId!: number;

  // Địa chỉ ví để gọi contract chính xác
  @ApiProperty({ description: "Ví của người mua", required: false })
  buyerWalletAddress?: string;

  @ApiProperty({ description: "Ví của người bán", required: false })
  sellerWalletAddress?: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  totalWei!: string;

  @ApiProperty({ required: false, nullable: true })
  onchainOrderId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  shippingAddress?: string | null;

  @ApiProperty()
  createdAt!: string;

  static fromEntity(order: Order & { product?: Product | null; buyer?: { walletAddress: string } | null; seller?: { walletAddress: string } | null }): OrderDto {
    const dto = new OrderDto();
    dto.id = order.id;
    dto.status = order.status as OrderStatus;
    dto.productId = order.productId;
    dto.product = order.product ? OrderProductSummaryDto.fromEntity(order.product) : null;
    dto.buyerId = order.buyerId;
    dto.sellerId = order.sellerId;
    dto.buyerWalletAddress = order.buyer?.walletAddress;
    dto.sellerWalletAddress = order.seller?.walletAddress;
    dto.quantity = order.quantity;
    dto.totalWei = order.totalWei.toString();
    dto.onchainOrderId = order.onchainOrderId;
    dto.shippingAddress = order.shippingAddress;
    dto.createdAt = order.createdAt.toISOString();
    return dto;
  }
}
