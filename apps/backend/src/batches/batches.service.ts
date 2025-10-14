import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";
import { UserRole } from "../users/user-role.enum";

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CurrentUserType, dto: CreateBatchDto): Promise<BatchListItemDto> {
    const batchCode = dto.batchCode ?? this.generateBatchCode();
    const priceWei = dto.priceEth ? BigInt(Math.round(dto.priceEth * 1e18)) : BigInt(0);
    const harvestDate = dto.harvestDate ? new Date(dto.harvestDate) : null;

    const batch = await this.prisma.batch.create({
      data: {
        batchCode,
        farmName: dto.farmName ?? null,
        variety: dto.variety ?? dto.productName,
        harvestDate,
        notes: dto.quantityNote ?? null,
        ipfsCid: dto.ipfsCid ?? null,
        hashSha256: dto.hashSha256 ?? null,
        createdBy: user.id,
        products: {
          create: {
            name: dto.productName,
            description: dto.quantityNote ?? null,
            priceWei,
            stock: dto.stock ? Math.round(dto.stock) : 0,
            sellerId: user.id,
          },
        },
      },
      include: { products: true },
    });

    return this.mapBatch(batch);
  }

  async findForUser(user: CurrentUserType): Promise<BatchListItemDto[]> {
    const where = this.buildWhereClause(user);
    const batches = await this.prisma.batch.findMany({
      where,
      include: { products: true },
      orderBy: { createdAt: "desc" },
    });
    return batches.map((batch) => this.mapBatch(batch));
  }

  private buildWhereClause(user: CurrentUserType): Prisma.BatchWhereInput {
    if (user.role === UserRole.Seller) {
      return { createdBy: user.id };
    }
    return {};
  }

  private mapBatch(batch: Prisma.BatchGetPayload<{ include: { products: true } }>): BatchListItemDto {
    const dto = new BatchListItemDto();
    dto.id = batch.id;
    dto.batchCode = batch.batchCode;
    dto.productName = batch.products[0]?.name ?? "Chưa đặt tên";
    dto.status = this.resolveStatus(batch);
    dto.quantityNote = batch.notes;
    dto.harvestDate = batch.harvestDate ? batch.harvestDate.toISOString() : null;
    dto.ipfsCid = batch.ipfsCid ?? null;
    dto.hashSha256 = batch.hashSha256 ?? null;
    dto.createdAt = batch.createdAt.toISOString();
    return dto;
  }

  private resolveStatus(batch: Prisma.BatchGetPayload<{ include: { products: true } }>): string {
    const hasStock = batch.products.some((product) => product.stock > 0);
    if (hasStock) return "Đang bán";
    if (batch.hashSha256) return "Đã khóa";
    return "Nháp";
  }

  private generateBatchCode(): string {
    const now = new Date();
    return BATCH--;
  }
}
