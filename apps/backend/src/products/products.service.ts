import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Batch, Product, User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { UserRole } from "../users/user-role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

type ProductWithRelations = Product & { seller: User; batch: Batch | null };

const productInclude = {
  batch: true,
  seller: true,
} as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto, sellerId: number): Promise<ProductWithRelations> {
    const batch = await this.prisma.batch.findUnique({ where: { id: dto.batchId } });
    if (!batch) {
      throw new NotFoundException("Batch not found");
    }
    if (batch.createdBy !== sellerId) {
      throw new ForbiddenException("You can only create products for your batches");
    }

    return this.prisma.product.create({
      data: {
        batchId: dto.batchId,
        sellerId,
        name: dto.name,
        description: dto.description ?? null,
        priceWei: new Prisma.Decimal(dto.priceWei),
        stock: dto.stock,
        coverImageUrl: dto.coverImageUrl ?? null,
      },
      include: productInclude,
    });
  }

  async findAll(role: UserRole, userId: number): Promise<ProductWithRelations[]> {
    if (role === UserRole.Admin) {
      return this.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: productInclude,
      });
    }

    if (role === UserRole.Seller) {
      return this.prisma.product.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
        include: productInclude,
      });
    }

    return this.prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<ProductWithRelations> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (role === UserRole.Admin) {
      return product;
    }

    if (role === UserRole.Seller && product.sellerId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (role === UserRole.Buyer && product.stock <= 0) {
      throw new NotFoundException("Product unavailable");
    }

    return product;
  }

  async decrementStock(productId: number, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
      },
    });
  }

  async update(id: number, sellerId: number, dto: UpdateProductDto): Promise<ProductWithRelations> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Product not found");
    }
    if (existing.sellerId !== sellerId) {
      throw new ForbiddenException("You can only update your own products");
    }

    if (dto.batchId) {
      const batch = await this.prisma.batch.findUnique({ where: { id: dto.batchId } });
      if (!batch) throw new NotFoundException("Batch not found");
      if (batch.createdBy !== sellerId) {
        throw new ForbiddenException("You can only use your own batches");
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        batchId: dto.batchId ?? undefined,
        name: dto.name ?? undefined,
        description: dto.description ?? undefined,
        priceWei: dto.priceWei !== undefined ? new Prisma.Decimal(dto.priceWei) : undefined,
        stock: dto.stock ?? undefined,
        coverImageUrl: dto.coverImageUrl ?? undefined,
      },
      include: productInclude,
    });
    return updated;
  }

  async remove(id: number, sellerId: number): Promise<void> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Product not found");
    }
    if (existing.sellerId !== sellerId) {
      throw new ForbiddenException("You can only delete your own products");
    }

    // Ngăn xóa nếu đã có đơn hàng tham chiếu để tránh lỗi FK (SQL Server NoAction)
    const relatedOrders = await this.prisma.order.count({ where: { productId: id } });
    if (relatedOrders > 0) {
      throw new ForbiddenException(
        "Không thể xóa sản phẩm vì đã có đơn hàng liên quan. Vui lòng đặt tồn kho = 0 để ẩn sản phẩm, hoặc hủy/hoàn tất các đơn trước."
      );
    }

    await this.prisma.product.delete({ where: { id } });
  }
}
