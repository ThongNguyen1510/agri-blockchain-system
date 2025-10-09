import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Product } from "@prisma/client";
import { UserRole } from "../users/user-role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto, sellerId: number): Promise<Product> {
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
        priceWei: BigInt(dto.priceWei),
        stock: dto.stock,
        coverImageUrl: dto.coverImageUrl ?? null,
      },
    });
  }

  async findAll(role: UserRole, userId: number): Promise<Product[]> {
    if (role === UserRole.Admin) {
      return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (role === UserRole.Seller) {
      return this.prisma.product.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
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
}