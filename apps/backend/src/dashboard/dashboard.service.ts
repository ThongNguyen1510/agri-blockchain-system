import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CurrentUserType } from "../auth/decorators/current-user.decorator";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";

type OrderFilter = Prisma.OrderWhereInput;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(user: CurrentUserType): Promise<DashboardSummaryDto> {
    const orderFilter = this.buildOrderFilter(user);

    const [totalOrders, activeEscrows, disputes, releasedSum] = await Promise.all([
      this.prisma.order.count({ where: orderFilter }),
      this.prisma.order.count({ where: { ...orderFilter, status: "Held" } }),
      this.prisma.order.count({ where: { ...orderFilter, status: "Disputed" } }),
      this.prisma.order.aggregate({
        _sum: { totalWei: true },
        where: { ...orderFilter, status: "Released" },
      }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      where: orderFilter,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
      },
      take: 10,
    });

    const salesSource = await this.prisma.order.findMany({
      where: { ...orderFilter, status: "Released" },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const stats = {
      totalOrders,
      activeEscrows,
      disputes,
      releasedVolumeEth: this.toEthString(releasedSum._sum.totalWei),
    };

    const sales = this.buildSalesSeries(salesSource);
    const recent = recentOrders.slice(0, 5).map((order) => ({
      id: order.id,
      productName: order.product?.name ?? "Sản phẩm",
      totalEth: this.toEthString(order.totalWei),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));

    const dto = new DashboardSummaryDto();
    dto.stats = stats;
    dto.sales = sales;
    dto.recentOrders = recent;
    return dto;
  }

  private buildOrderFilter(user: CurrentUserType): OrderFilter {
    if (user.role === "Seller") {
      return { sellerId: user.id };
    }
    if (user.role === "Buyer") {
      return { buyerId: user.id };
    }
    return {};
  }

  private buildSalesSeries(orders: Array<{ createdAt: Date; totalWei: bigint }>) {
    const revenueByMonth = new Map<string, number>();
    for (const order of orders) {
      const monthKey = this.getMonthKey(order.createdAt);
      const current = revenueByMonth.get(monthKey) ?? 0;
      revenueByMonth.set(monthKey, current + this.toEthNumber(order.totalWei));
    }

    const sorted = Array.from(revenueByMonth.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(-6);

    return sorted.map(([key, value]) => ({
      label: this.formatMonthLabel(key),
      value: Number(value.toFixed(2)),
    }));
  }

  private toEthNumber(wei?: bigint | null): number {
    if (!wei) return 0;
    return Number(wei) / 1e18;
  }

  private toEthString(wei?: bigint | null): string {
    return this.toEthNumber(wei).toFixed(4);
  }

  private getMonthKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    return `${year}-${month.toString().padStart(2, "0")}`;
  }

  private formatMonthLabel(key: string): string {
    const [year, month] = key.split("-");
    return `Th${Number(month)}/${year.substring(2)}`;
  }
}
