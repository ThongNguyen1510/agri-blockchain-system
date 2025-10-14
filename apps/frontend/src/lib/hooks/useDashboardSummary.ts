import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../apiClient";

export interface DashboardSummary {
  stats: {
    totalOrders: number;
    activeEscrows: number;
    releasedVolumeEth: string;
    disputes: number;
  };
  sales: Array<{ label: string; value: number }>;
  recentOrders: Array<{
    id: number;
    productName: string;
    totalEth: string;
    status: string;
    createdAt: string;
  }>;
}

export const useDashboardSummary = (token?: string | null) =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    enabled: Boolean(token),
    queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary", { token: token ?? undefined }),
    staleTime: 60_000,
  });
