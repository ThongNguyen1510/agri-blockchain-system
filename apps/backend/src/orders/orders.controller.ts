import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "../users/user-role.enum";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderDto } from "./dto/order.dto";
import { OrdersService } from "./orders.service";
import { UpdateOrderDto } from "./dto/update-order.dto";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(UserRole.Buyer)
  @Post()
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.ordersService.create(dto, user.id);
    return OrderDto.fromEntity(order);
  }

  @Roles(UserRole.Buyer)
  @Patch(":id")
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ): Promise<OrderDto> {
    const order = await this.ordersService.update(id, user.id, dto);
    return OrderDto.fromEntity(order);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserType): Promise<OrderDto[]> {
    const orders = await this.ordersService.findAll(user.role as UserRole, user.id);
    return orders.map(OrderDto.fromEntity);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    const order = await this.ordersService.findOne(id, user.id, user.role as UserRole);
    return OrderDto.fromEntity(order);
  }

  @Roles(UserRole.Seller)
  @Post(":id/release")
  async release(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    const order = await this.ordersService.release(id, user.id);
    return OrderDto.fromEntity(order);
  }

  // Demo: Buyer marks order as held (after on-chain payment)
  @Roles(UserRole.Buyer)
  @Post(":id/hold")
  async hold(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    const order = await this.ordersService.hold(id, user.id);
    return OrderDto.fromEntity(order);
  }

  @Post(":id/cancel")
  async cancel(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<OrderDto> {
    const order = await this.ordersService.cancel(id, user.id, user.role as UserRole);
    return OrderDto.fromEntity(order);
  }
}