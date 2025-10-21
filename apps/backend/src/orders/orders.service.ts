import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Order, Product } from "@prisma/client";
import { UserRole } from "../users/user-role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { OrderStatus } from "./order-status.enum";
import { CreateOrderDto } from "./dto/create-order.dto";

type OrderWithProduct = Order & { product: Product | null };

const orderInclude = {
  product: true,
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

    const totalWei = product.priceWei * BigInt(dto.quantity);

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
}
