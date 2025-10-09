import { Controller, Get, Param, ParseIntPipe, Post, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "../users/user-role.enum";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { BatchDto } from "./dto/batch.dto";
import { BatchesService } from "./batches.service";

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

  @Get(":id")
  async findOne(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<BatchDto> {
    const batch = await this.batchesService.findOne(id, user.id, user.role as UserRole);
    return BatchDto.fromEntity(batch);
  }
}

