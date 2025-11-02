export type UserRole = "Seller" | "Buyer" | "Admin";

export interface UserDto {
  id: number;
  email: string;
  role: UserRole;
  walletAddress: string;
}

export interface BatchDto {
  id: number;
  batchCode: string;
  farmName?: string | null;
  harvestDate?: string | null;
  variety?: string | null;
  notes?: string | null;
  ipfsCid?: string | null;
  hashSha256?: string | null;
  createdBy: number;
  createdAt: string;
}

export interface BatchSummaryDto {
  id: number;
  batchCode: string;
  productName: string;
  status: string;
  quantityNote: string | null;
  harvestDate: string | null;
  ipfsCid: string | null;
  hashSha256: string | null;
  createdAt: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description?: string | null;
  priceWei: string;
  stock: number;
  coverImageUrl?: string | null;
  batchId: number;
  sellerId: number;
  createdAt: string;
  seller?: UserDto | null;
  batch?: BatchDto | null;
}

export interface OrderProductSummaryDto {
  id: number;
  name: string;
  priceWei: string;
}

export type OrderStatus =
  | "Pending"
  | "Held"
  | "Released"
  | "Refunded"
  | "Disputed"
  | "PENDING"
  | "IN_ESCROW"
  | "RELEASED"
  | "REFUNDED"
  | "DISPUTED";

export interface OrderDto {
  id: number;
  status: OrderStatus;
  productId: number;
  product?: OrderProductSummaryDto | null;
  buyerId: number;
  sellerId: number;
  // Địa chỉ ví của người mua/người bán để gọi contract chính xác
  buyerWalletAddress?: string;
  sellerWalletAddress?: string;
  quantity: number;
  totalWei: string;
  onchainOrderId?: string | null;
  shippingAddress?: string | null;
  createdAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface DashboardStatsDto {
  totalOrders: number;
  activeEscrows: number;
  releasedVolumeEth: string;
  disputes: number;
}

export interface DashboardSalesPointDto {
  label: string;
  value: number;
}

export interface DashboardRecentOrderDto {
  id: number;
  productName: string;
  totalEth: string;
  status: string;
  createdAt: string;
}

export interface DashboardSummaryDto {
  stats: DashboardStatsDto;
  sales: DashboardSalesPointDto[];
  recentOrders: DashboardRecentOrderDto[];
}
