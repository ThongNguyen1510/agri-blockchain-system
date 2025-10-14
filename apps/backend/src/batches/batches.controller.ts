import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user-role.enum";
import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { BatchListItemDto } from "./dto/batch-list-item.dto";

@ApiTags("batches")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("batches")
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get("me")
  async getMyBatches(@CurrentUser() user: CurrentUserType): Promise<BatchListItemDto[]> {
    return this.batchesService.findForUser(user);
  }

  @Roles(UserRole.Seller, UserRole.Admin)
  @Post()
  async createBatch(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateBatchDto,
  ): Promise<BatchListItemDto> {
    return this.batchesService.create(user, dto);
  }
}
