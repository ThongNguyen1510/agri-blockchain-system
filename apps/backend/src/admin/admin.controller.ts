import { Controller, Get, Patch, Delete, Param, ParseIntPipe, Query, Body } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user-role.enum";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@ApiBearerAuth()
@Roles(UserRole.Admin)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "role", required: false, enum: UserRole })
  async getAllUsers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("role") role?: UserRole,
  ) {
    return this.adminService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      role,
    );
  }

  @Patch("users/:id/role")
  async updateUserRole(
    @Param("id", ParseIntPipe) id: number,
    @Body("role") role: UserRole,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get("products")
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "sellerId", required: false })
  async getAllProducts(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sellerId") sellerId?: string,
  ) {
    return this.adminService.getAllProducts(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      sellerId ? parseInt(sellerId) : undefined,
    );
  }

  @Delete("products/:id")
  async deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  @Get("orders")
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "status", required: false })
  async getAllOrders(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.adminService.getAllOrders(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get("stats")
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get("audit-logs")
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getAuditLogs(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.adminService.getAuditLogs(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
