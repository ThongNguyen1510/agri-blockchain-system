import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserRole } from "../users/user-role.enum";
import { BatchesService } from "./batches.service";
import { BlockchainService } from "../blockchain/blockchain.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { BatchDto } from "./dto/batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";
import { TransferOwnershipDto } from "./dto/transfer-ownership.dto";
import { TransportUpdateDto } from "./dto/transport-update.dto";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("batches")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("batches")
export class BatchesController {
  constructor(
    private readonly batchesService: BatchesService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Roles(UserRole.Seller)
  @Post()
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateBatchDto,
  ): Promise<BatchDto> {
    const batch = await this.batchesService.create(dto, user.id);
    return BatchDto.fromEntity(batch);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserType): Promise<BatchDto[]> {
    const batches = await this.batchesService.findAllForUser(user.id, user.role as UserRole);
    return batches.map(BatchDto.fromEntity);
  }

  @Get("me")
  async getMySummaries(@CurrentUser() user: CurrentUserType): Promise<BatchListItemDto[]> {
    return this.batchesService.findSummariesForUser(user);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<BatchDto> {
    const batch = await this.batchesService.findOne(id, user.id, user.role as UserRole);
    return BatchDto.fromEntity(batch);
  }

  @Roles(UserRole.Seller)
  @Patch(":id")
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBatchDto,
  ): Promise<BatchDto> {
    const batch = await this.batchesService.update(id, dto, user.id, user.role as UserRole);
    return BatchDto.fromEntity(batch);
  }

  @Get(":id/verify")
  async verifyBatch(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ anchored: boolean; verified: boolean; onChainHash?: string; message: string }> {
    const batch = await this.batchesService.findOne(id, user.id, user.role as UserRole);
    
    if (!this.blockchainService.isAvailable()) {
      return {
        anchored: false,
        verified: false,
        message: "Blockchain service not available",
      };
    }

    const result = await this.blockchainService.verifyBatchHash(batch.id, {
      batchCode: batch.batchCode,
      farmName: batch.farmName ?? "",
      harvestDate: batch.harvestDate?.toISOString() ?? "",
      variety: batch.variety ?? "",
      notes: batch.notes ?? "",
      ipfsCid: batch.ipfsCid ?? "",
    });

    let message = "Batch not anchored on blockchain";
    if (result.anchored && result.verified) {
      message = "Batch verified successfully on blockchain";
    } else if (result.anchored && !result.verified) {
      message = "Batch anchored but hash mismatch";
    }

    return { ...result, message };
  }

  // Anchor batch hash on-chain and return tx hash
  @Roles(UserRole.Seller)
  @Post(":id/anchor")
  async anchorBatch(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ txHash: string }> {
    const batch = await this.batchesService.findOne(id, user.id, user.role as UserRole);

    if (!this.blockchainService.isAvailable()) {
      throw new Error("Blockchain service not available");
    }

    const tx = await this.blockchainService.anchorBatchHashTx(batch.id, {
      batchCode: batch.batchCode,
      farmName: batch.farmName ?? "",
      harvestDate: batch.harvestDate?.toISOString() ?? "",
      variety: batch.variety ?? "",
      notes: batch.notes ?? "",
      ipfsCid: batch.ipfsCid ?? "",
    });
    return tx;
  }

  // ---- Ownership Transfer ----
  @Post(":id/ownership-transfer")
  async transferOwnership(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: TransferOwnershipDto,
  ) {
    return this.batchesService.transferOwnership(id, user, dto);
  }

  @Get(":id/ownership-history")
  async getOwnershipHistory(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.batchesService.getOwnershipHistory(id);
  }

  // ---- Transport Update (location, temperature) ----
  @Post(":id/transport-updates")
  async addTransportUpdate(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: TransportUpdateDto,
  ) {
    return this.batchesService.addTransportUpdate(id, user, dto);
  }

  // ---- Public Trace endpoints (no auth) ----
  @Public()
  @Get("public/by-code/:batchCode")
  async getByCodePublic(
    @Param("batchCode") batchCode: string,
  ): Promise<BatchDto> {
    const batch = await this.batchesService.findByBatchCodePublic(batchCode);
    if (!batch) {
      throw new Error("Batch not found");
    }
    return BatchDto.fromEntity(batch);
  }

  @Public()
  @Get("public/by-code/:batchCode/ownership-history")
  async getOwnershipHistoryByCodePublic(
    @Param("batchCode") batchCode: string,
  ) {
    const batch = await this.batchesService.findByBatchCodePublic(batchCode);
    if (!batch) {
      throw new Error("Batch not found");
    }
    return this.batchesService.getOwnershipHistoryPublic(batch.id);
  }
}
