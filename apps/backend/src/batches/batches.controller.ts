import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserRole } from "../users/user-role.enum";
import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";
import { BatchDto } from "./dto/batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";

@ApiTags("batches")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("batches")
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

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
}
