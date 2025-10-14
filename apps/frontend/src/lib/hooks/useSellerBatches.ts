import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../apiClient";

export interface SellerBatchItem {
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

export const useSellerBatches = (token?: string | null) =>
  useQuery({
    queryKey: ["batches", "me"],
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch<SellerBatchItem[]>("/batches/me", {
        token: token ?? undefined,
      }),
    staleTime: 30_000,
  });
