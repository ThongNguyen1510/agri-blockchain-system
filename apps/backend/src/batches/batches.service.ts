import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Batch } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../users/user-role.enum";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBatchDto, creatorId: number): Promise<Batch> {
    const batchCode = dto.batchCode ?? this.generateBatchCode();
    return this.prisma.batch.create({
      data: {
        batchCode,
        farmName: dto.farmName ?? null,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
        variety: dto.variety ?? dto.productName ?? null,
        notes: dto.notes ?? dto.quantityNote ?? null,
        ipfsCid: dto.ipfsCid ?? null,
        hashSha256: dto.hashSha256 ?? null,
        owner: {
          connect: { id: creatorId },
        },
      },
    });
  }

  async createForUser(user: CurrentUserType, dto: CreateBatchDto): Promise<BatchListItemDto> {
    const batch = await this.create(dto, user.id);
    return this.mapToListItem(batch);
  }

  async findAllForUser(userId: number, role: UserRole): Promise<Batch[]> {
    if (role === UserRole.Admin) {
      return this.prisma.batch.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return this.prisma.batch.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSummariesForUser(user: CurrentUserType): Promise<BatchListItemDto[]> {
    const batches = await this.findAllForUser(user.id, user.role as UserRole);
    return batches.map((batch) => this.mapToListItem(batch));
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<Batch> {
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      throw new NotFoundException("Batch not found");
    }
    if (role !== UserRole.Admin && batch.createdBy !== userId) {
      throw new ForbiddenException("Access denied");
    }
    return batch;
  }

  private mapToListItem(batch: Batch): BatchListItemDto {
    const dto = new BatchListItemDto();
    dto.id = batch.id;
    dto.batchCode = batch.batchCode;
    dto.productName = batch.variety ?? batch.notes ?? batch.batchCode;
    dto.status = batch.hashSha256 ? "Đã khóa" : "Nháp";
    dto.quantityNote = batch.notes;
    dto.harvestDate = batch.harvestDate ? batch.harvestDate.toISOString() : null;
    dto.ipfsCid = batch.ipfsCid ?? null;
    dto.hashSha256 = batch.hashSha256 ?? null;
    dto.createdAt = batch.createdAt.toISOString();
    return dto;
  }

  private generateBatchCode(): string {
    const now = new Date();
    const datePart = ${now.getUTCFullYear()};
    const timePart = ${now.getUTCHours().toString().padStart(2, "0")};
    return BATCH--;
  }
}
