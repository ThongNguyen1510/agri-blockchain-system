import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "../users/user-role.enum";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductDto } from "./dto/product.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.Seller)
  @Post()
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateProductDto,
  ): Promise<ProductDto> {
    const product = await this.productsService.create(dto, user.id);
    return ProductDto.fromEntity(product);
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserType): Promise<ProductDto[]> {
    const products = await this.productsService.findAll(user.role as UserRole, user.id);
    return products.map(ProductDto.fromEntity);
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductDto> {
    const product = await this.productsService.findOne(id, user.id, user.role as UserRole);
    return ProductDto.fromEntity(product);
  }
}