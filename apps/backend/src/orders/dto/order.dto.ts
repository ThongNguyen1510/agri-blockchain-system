import { ApiProperty } from "@nestjs/swagger";
import { Order } from "@prisma/client";
import { OrderStatus } from "../order-status.enum";

export class OrderDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  productId!: number;

  @ApiProperty()
  buyerId!: number;

  @ApiProperty()
  sellerId!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  totalWei!: string;

  @ApiProperty({ required: false, nullable: true })
  onchainOrderId?: string | null;

  @ApiProperty({ required: false, nullable: true })
  shippingAddress?: string | null;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(order: Order): OrderDto {
    const dto = new OrderDto();
    dto.id = order.id;
    dto.status = order.status as OrderStatus;
    dto.productId = order.productId;
    dto.buyerId = order.buyerId;
    dto.sellerId = order.sellerId;
    dto.quantity = order.quantity;
    dto.totalWei = order.totalWei.toString();
    dto.onchainOrderId = order.onchainOrderId;
    dto.shippingAddress = order.shippingAddress;
    dto.createdAt = order.createdAt;
    return dto;
  }
}