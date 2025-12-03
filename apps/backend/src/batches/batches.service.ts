import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Batch } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BlockchainService } from "../blockchain/blockchain.service";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { UserRole } from "../users/user-role.enum";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";
import { TransferOwnershipDto } from "./dto/transfer-ownership.dto";
import { TransportUpdateDto } from "./dto/transport-update.dto";
import { QcOkDto } from "./dto/qc-ok.dto";
import * as crypto from "crypto";

@Injectable()
export class BatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchain: BlockchainService,
  ) {}

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

  async qcOkAndTransfer(batchId: number, user: CurrentUserType, dto: QcOkDto) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException("Batch not found");

    const fromRole = "QC";
    const fromName = dto.inspector;

    let txHash: string | null = null;
    try {
      if (this.blockchain.isAvailable()) {
        const { txHash: h } = await this.blockchain.recordBatchTransferTx(batchId, {
          fromRole,
          toRole: dto.toRole,
          fromName,
          toName: dto.toName,
        });
        txHash = h;
      }
    } catch {
      txHash = null;
    }

    return this.prisma.batchOwnershipHistory.create({
      data: {
        batchId,
        fromRole,
        fromName,
        toRole: dto.toRole,
        toName: dto.toName,
        txHash,
      },
    });
  }

  // Public: find batch by code without auth
  async findByBatchCodePublic(batchCode: string): Promise<Batch | null> {
    return this.prisma.batch.findUnique({ where: { batchCode } });
  }

  async addTransportUpdate(batchId: number, user: CurrentUserType, dto: TransportUpdateDto) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException("Batch not found");

    // Pack transport info
    const fromRole = "Transport";
    const toRole = "Transport";
    const fromName = dto.location;
    const toName = `${dto.temperature}°C`;

    // Try record on-chain
    let txHash: string | null = null;
    try {
      if (this.blockchain.isAvailable()) {
        const { txHash: h } = await this.blockchain.recordBatchTransferTx(batchId, {
          fromRole,
          toRole,
          fromName,
          toName,
        });
        txHash = h;
      }
    } catch {
      txHash = null;
    }

    return this.prisma.batchOwnershipHistory.create({
      data: {
        batchId,
        fromRole,
        toRole,
        fromName,
        toName,
        txHash,
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

    // Kiểm tra xem lô đã được khóa (có hash/IPFS) hoặc đã anchor on-chain
    const offchainLocked = Boolean(batch.ipfsCid || batch.hashSha256);
    let onchainAnchored = false;
    try {
      if (this.blockchain.isAvailable()) {
        onchainAnchored = await this.blockchain.isBatchAnchored(id);
      }
    } catch {
      onchainAnchored = false;
    }
    const isLocked = offchainLocked || onchainAnchored;

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

  // --- Ownership transfer & history ---
  async transferOwnership(batchId: number, user: CurrentUserType, dto: TransferOwnershipDto) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException("Batch not found");

    // Determine current owner from latest history; default to farmer (creator)
    const last = await this.prisma.batchOwnershipHistory.findFirst({
      where: { batchId },
      orderBy: { createdAt: "desc" },
    });

    const fromRole = last?.toRole ?? "Farmer";
    const fromName = last?.toName ?? (user.email ?? `User#${user.id}`);

    // Call blockchain to record transfer if available
    let txHash: string | null = null;
    try {
      if (this.blockchain.isAvailable()) {
        const { txHash: h } = await this.blockchain.recordBatchTransferTx(batchId, {
          fromRole,
          toRole: dto.toRole,
          fromName,
          toName: dto.toName,
        });
        txHash = h;
      }
    } catch (e) {
      // If on-chain fails, still persist off-chain history without txHash
      txHash = null;
    }

    return this.prisma.batchOwnershipHistory.create({
      data: {
        batchId,
        fromRole,
        fromName,
        toRole: dto.toRole,
        toName: dto.toName,
        txHash,
      },
    });
  }

  async getOwnershipHistory(batchId: number) {
    const exists = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!exists) throw new NotFoundException("Batch not found");
    return this.prisma.batchOwnershipHistory.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Public ownership history (no auth)
  async getOwnershipHistoryPublic(batchId: number) {
    const exists = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!exists) throw new NotFoundException("Batch not found");
    return this.prisma.batchOwnershipHistory.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" },
    });
  }
}
