import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Order, Product } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { UserRole } from "../users/user-role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "./order-status.enum";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

type OrderWithProduct = Order & {
  product: Product | null;
  // Bổ sung thông tin ví để trả về cho frontend (chỉ chọn walletAddress)
  buyer?: { walletAddress: string };
  seller?: { walletAddress: string };
};

const orderInclude = {
  product: true,
  buyer: { select: { walletAddress: true } },
  seller: { select: { walletAddress: true } },
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto, buyerId: number): Promise<OrderWithProduct> {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException("Insufficient stock");
    }
    if (product.sellerId === buyerId) {
      throw new BadRequestException("Seller cannot order their own product");
    }

    const totalWei = new Prisma.Decimal(product.priceWei).mul(dto.quantity);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          productId: product.id,
          buyerId,
          sellerId: product.sellerId,
          quantity: dto.quantity,
          totalWei,
          status: OrderStatus.Pending,
          shippingAddress: dto.shippingAddress ?? null,
        },
        include: orderInclude,
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: dto.quantity } },
      });

      return created;
    });

    return order;
  }

  async findAll(role: UserRole, userId: number): Promise<OrderWithProduct[]> {
    if (role === UserRole.Admin) {
      return this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: orderInclude,
      });
    }
    if (role === UserRole.Seller) {
      return this.prisma.order.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: orderInclude,
      });
    }

    return this.prisma.order.findMany({
      where: { buyerId: userId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<OrderWithProduct> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (role === UserRole.Admin) {
      return order;
    }

    if (role === UserRole.Buyer && order.buyerId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (role === UserRole.Seller && order.sellerId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    return order;
  }

  async release(orderId: number, sellerId: number): Promise<OrderWithProduct> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.sellerId !== sellerId) {
      throw new ForbiddenException("Only the seller can release this order");
    }

    if (order.status !== OrderStatus.InEscrow) {
      throw new BadRequestException("Order is not in held status");
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.Released },
      include: orderInclude,
    });

    return updatedOrder;
  }

  async hold(orderId: number, buyerId: number): Promise<OrderWithProduct> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) throw new NotFoundException("Order not found");
    if (order.buyerId !== buyerId) throw new ForbiddenException("Only the buyer can mark as held");
    if (order.status !== OrderStatus.Pending) throw new BadRequestException("Order is not pending");

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.InEscrow },
      include: orderInclude,
    });
    return updated;
  }

  async update(orderId: number, buyerId: number, dto: UpdateOrderDto): Promise<OrderWithProduct> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException("Order not found");
    if (order.buyerId !== buyerId) throw new ForbiddenException("Only the buyer can update this order");
    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException("Only pending orders can be updated");
    }

    let newQuantity = order.quantity;
    if (dto.quantity !== undefined) {
      if (dto.quantity < 1) throw new BadRequestException("Quantity must be at least 1");
      newQuantity = dto.quantity;
    }

    const product = await this.prisma.product.findUnique({ where: { id: order.productId } });
    if (!product) throw new NotFoundException("Product not found");

    const delta = newQuantity - order.quantity;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (delta !== 0) {
        if (delta > 0) {
          // Increase order qty -> need available stock
          if (product.stock < delta) throw new BadRequestException("Insufficient stock");
          await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: delta } } });
        } else {
          // Decrease order qty -> return stock
          await tx.product.update({ where: { id: product.id }, data: { stock: { increment: -delta } } });
        }
      }

      const totalWei = new Prisma.Decimal(product.priceWei).mul(newQuantity);
      return tx.order.update({
        where: { id: orderId },
        data: {
          quantity: newQuantity,
          totalWei,
          shippingAddress: dto.shippingAddress !== undefined ? dto.shippingAddress : order.shippingAddress,
        },
        include: orderInclude,
      });
    });

    return updated;
  }

  async cancel(orderId: number, userId: number, userRole: UserRole): Promise<OrderWithProduct> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Check permissions
    if (userRole === UserRole.Buyer && order.buyerId !== userId) {
      throw new ForbiddenException("Only the buyer can cancel this order");
    }

    if (userRole === UserRole.Seller && order.sellerId !== userId) {
      throw new ForbiddenException("Only the seller can cancel this order");
    }

    if (order.status !== OrderStatus.Pending && order.status !== OrderStatus.InEscrow) {
      throw new BadRequestException("Order cannot be cancelled in current status");
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.Refunded },
        include: orderInclude,
      });

      // Restore product stock
      await tx.product.update({
        where: { id: order.productId },
        data: { stock: { increment: order.quantity } },
      });

      return updated;
    });

    return updatedOrder;
  }
}
