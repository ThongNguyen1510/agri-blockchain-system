import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Batch } from "@prisma/client";
import { UserRole } from "../users/user-role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBatchDto } from "./dto/create-batch.dto";

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBatchDto, creatorId: number): Promise<Batch> {
    return this.prisma.batch.create({
      data: {
        batchCode: dto.batchCode,
        farmName: dto.farmName ?? null,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : null,
        variety: dto.variety ?? null,
        notes: dto.notes ?? null,
        ipfsCid: dto.ipfsCid ?? null,
        hashSha256: dto.hashSha256 ?? null,
        owner: {
          connect: { id: creatorId },
        },
      },
    });
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
}

