import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Batch } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../users/user-role.enum";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";
import * as crypto from "crypto";

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBatchDto, creatorId: number): Promise<Batch> {
    const batchCode = dto.batchCode ?? this.generateBatchCode();
    
    // Tự động tạo hash SHA-256 từ dữ liệu batch
    const batchData = {
      batchCode,
      farmName: dto.farmName ?? null,
      harvestDate: dto.harvestDate ?? null,
      variety: dto.variety ?? dto.productName ?? null,
      notes: dto.notes ?? dto.quantityNote ?? null,
      creatorId,
    };
    
    const dataString = JSON.stringify(batchData);
    const hashSha256 = "0x" + crypto.createHash("sha256").update(dataString).digest("hex");
    
    // Tạo mock IPFS CID (trong production sẽ upload lên IPFS thật)
    const ipfsCid = `Qm${crypto.randomBytes(22).toString("base64").replace(/[+/=]/g, "")}`;
    
    return this.prisma.batch.create({
      data: {
        batchCode,
        farmName: dto.farmName ?? null,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
        variety: dto.variety ?? dto.productName ?? null,
        notes: dto.notes ?? dto.quantityNote ?? null,
        ipfsCid,
        hashSha256,
        documentUrl: dto.documentUrl ?? null,
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

  async update(id: number, dto: UpdateBatchDto, userId: number, role: UserRole): Promise<Batch> {
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) {
      throw new NotFoundException("Batch not found");
    }

    // Kiểm tra quyền sở hữu
    if (role !== UserRole.Admin && batch.createdBy !== userId) {
      throw new ForbiddenException("Chỉ chủ lô mới được chỉnh sửa");
    }

    // Kiểm tra xem lô đã được khóa (có hash/IPFS) chưa
    const isLocked = Boolean(batch.ipfsCid || batch.hashSha256);

    // Kiểm tra có đơn hàng liên quan không
    const hasOrders = await this.prisma.order.count({
      where: {
        product: { batchId: id },
      },
    });

    // Nếu đã khóa hoặc có đơn hàng, chỉ cho phép sửa notes, ipfsCid, hashSha256
    if (isLocked || hasOrders > 0) {
      if (dto.farmName || dto.harvestDate || dto.variety) {
        throw new ForbiddenException(
          "Lô đã được xác thực hoặc có đơn hàng. Chỉ có thể cập nhật ghi chú và chứng từ."
        );
      }
    }

    // Cập nhật batch
    return this.prisma.batch.update({
      where: { id },
      data: {
        farmName: dto.farmName ?? undefined,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : undefined,
        variety: dto.variety ?? undefined,
        notes: dto.notes ?? undefined,
        ipfsCid: dto.ipfsCid ?? undefined,
        hashSha256: dto.hashSha256 ?? undefined,
      },
    });
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
    dto.documentUrl = (batch as any).documentUrl ?? null;
    dto.createdAt = batch.createdAt.toISOString();
    return dto;
  }

  private generateBatchCode(): string {
    const now = new Date();
    const datePart =
      now.getUTCFullYear().toString() +
      (now.getUTCMonth() + 1).toString().padStart(2, "0") +
      now.getUTCDate().toString().padStart(2, "0");
    const timePart =
      now.getUTCHours().toString().padStart(2, "0") +
      now.getUTCMinutes().toString().padStart(2, "0") +
      now.getUTCSeconds().toString().padStart(2, "0");
    return `BATCH-${datePart}${timePart}`;
  }
}
