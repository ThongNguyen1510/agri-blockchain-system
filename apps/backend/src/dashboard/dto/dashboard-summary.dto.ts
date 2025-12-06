import { ApiProperty } from "@nestjs/swagger";

class DashboardStatsDto {
  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  totalProducts!: number;

  @ApiProperty()
  activeEscrows!: number;

  @ApiProperty()
  releasedVolumeEth!: string;

  @ApiProperty()
  disputes!: number;
}

class DashboardSalesPointDto {
  @ApiProperty()
  label!: string;

  @ApiProperty()
  value!: number;
}

class DashboardRecentOrderDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  totalEth!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: string;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: () => DashboardStatsDto })
  stats!: DashboardStatsDto;

  @ApiProperty({ type: () => [DashboardSalesPointDto] })
  sales!: DashboardSalesPointDto[];

  @ApiProperty({ type: () => [DashboardRecentOrderDto] })
  recentOrders!: DashboardRecentOrderDto[];
}
