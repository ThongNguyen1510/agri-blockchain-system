import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "../users/user-role.enum";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all users with pagination
   */
  async getAllUsers(page = 1, limit = 20, role?: UserRole) {
    const skip = (page - 1) * limit;
    
    const where = role ? { role } : {};
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          walletAddress: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              buyerOrders: true,
              sellerOrders: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: number, newRole: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        role: true,
        walletAddress: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(page = 1, limit = 20, sellerId?: number) {
    const skip = (page - 1) * limit;
    
    const where = sellerId ? { sellerId } : {};
    
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
            },
          },
          batch: {
            select: {
              id: true,
              batchCode: true,
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders with filters
   */
  async getAllOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalBatches,
      totalReviews,
      usersByRole,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.batch.count(),
      this.prisma.review.count(),
      this.prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      this.prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: {
            select: {
              email: true,
            },
          },
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate total revenue (sum of all orders)
    const revenueData = await this.prisma.order.aggregate({
      _sum: {
        totalWei: true,
      },
    });

    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalBatches,
        totalReviews,
        totalRevenueWei: revenueData._sum.totalWei?.toString() || "0",
      },
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count,
      })),
      ordersByStatus: ordersByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        buyerEmail: order.buyer.email,
        productName: order.product.name,
        totalWei: order.totalWei.toString(),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        orders: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.orders.length > 0) {
      throw new ForbiddenException("Cannot delete product with existing orders");
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    return { message: "Product deleted successfully" };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
