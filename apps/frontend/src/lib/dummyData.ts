import { RecentOrderRow } from "../components/dashboard/RecentOrdersTable";
import { SalesChartPoint } from "../components/dashboard/SalesChart";

export type ExtendedOrder = RecentOrderRow & {
  product?: string;
  value?: string;
  seller?: string;
  buyer?: string;
};

export const dummyOrders: ExtendedOrder[] = [
  {
    id: 1024,
    productName: "Saurieng Ri6 (Loai 1)",
    totalEth: "0.1500",
    status: "Held",
    createdAt: new Date().toISOString(),
    product: "Saurieng Ri6 (Loai 1)",
    value: "0.15 ETH",
    seller: "Seller Demo",
    buyer: "Buyer Demo",
  },
  {
    id: 1023,
    productName: "Vai thieu Luc Ngan",
    totalEth: "0.0500",
    status: "Released",
    createdAt: new Date().toISOString(),
    product: "Vai thieu Luc Ngan",
    value: "0.05 ETH",
    seller: "Seller Demo",
    buyer: "Buyer Demo",
  },
  {
    id: 1022,
    productName: "Cam sanh Ham Yen",
    totalEth: "0.2000",
    status: "Released",
    createdAt: new Date().toISOString(),
    product: "Cam sanh Ham Yen",
    value: "0.20 ETH",
    seller: "Seller Demo",
    buyer: "Buyer Demo",
  },
  {
    id: 1021,
    productName: "Thanh long Binh Thuan",
    totalEth: "0.0800",
    status: "Disputed",
    createdAt: new Date().toISOString(),
    product: "Thanh long Binh Thuan",
    value: "0.08 ETH",
    seller: "Seller Demo",
    buyer: "Buyer Demo",
  },
];

export const dummyChartData: SalesChartPoint[] = [
  { label: "Th1/25", value: 4.0 },
  { label: "Th2/25", value: 3.0 },
  { label: "Th3/25", value: 2.0 },
  { label: "Th4/25", value: 2.7 },
  { label: "Th5/25", value: 1.8 },
  { label: "Th6/25", value: 2.3 },
];

export const batchList = [
  {
    id: "BATCH-32",
    product: "Thanh long Binh Thuan",
    harvestDate: "2025-09-12",
    quantity: "2.5 tan",
    status: "Dang ban",
    cid: "bafybeigdyrv2...",
  },
  {
    id: "BATCH-31",
    product: "Saurieng Ri6",
    harvestDate: "2025-09-05",
    quantity: "1.2 tan",
    status: "Da khoa",
    cid: "bafybeic3fgqd...",
  },
];

export const recentOrders = dummyOrders;

export const adminUsers = [
  {
    id: 1,
    email: "admin@agrochain.local",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-10-13 09:10",
  },
  {
    id: 2,
    email: "seller@agrochain.local",
    role: "Seller",
    status: "Active",
    lastLogin: "2025-10-13 08:45",
  },
  {
    id: 3,
    email: "buyer@agrochain.local",
    role: "Buyer",
    status: "Pending",
    lastLogin: "2025-10-12 21:12",
  },
];
