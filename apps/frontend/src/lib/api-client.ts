import type {
  AuthResponseDto,
  BatchDto,
  BatchSummaryDto,
  DashboardSummaryDto,
  OrderDto,
  ProductDto,
  OwnershipHistoryDto,
} from "@/types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestOptions = RequestInit & {
  token?: string | null;
  searchParams?: Record<string, string | number | undefined | null>;
};

async function apiRequest<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const { token, headers, body, searchParams, ...init } = options;

  const url = new URL(path, API_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  // Chỉ tạo Headers nếu headers không phải undefined
  // Nếu headers === undefined, nghĩa là đang upload file, không set Content-Type
  const requestHeaders = headers === undefined ? new Headers() : new Headers(headers);
  
  // Chỉ set Content-Type cho JSON nếu không phải FormData
  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  
  if (token) {
    console.log("Setting Authorization header with token:", token.substring(0, 20) + "...");
    requestHeaders.set("Authorization", `Bearer ${token}`);
  } else {
    console.warn("No token provided for API request to:", path);
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    body,
  });

  const contentType = response.headers.get("Content-Type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    if (isJson) {
      try {
        const data = (await response.json()) as { message?: string | string[] };
        if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        } else if (data.message) {
          message = data.message;
        }
      } catch {
        // ignore parse errors
      }
    }

    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (!isJson) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  login(email: string, password: string) {
    return apiRequest<AuthResponseDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Ownership transfer & history
  transferBatchOwnership(batchId: number, body: { toRole: string; toName: string }, token: string) {
    return apiRequest<OwnershipHistoryDto>(`/batches/${batchId}/ownership-transfer`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  getBatchOwnershipHistory(batchId: number, token: string) {
    return apiRequest<OwnershipHistoryDto[]>(`/batches/${batchId}/ownership-history`, { token });
  },

  // Anchor batch on-chain
  anchorBatch(batchId: number, token: string) {
    return apiRequest<{ txHash: string }>(`/batches/${batchId}/anchor`, {
      method: "POST",
      token,
    });
  },

  // Transport update (location, temperature)
  addTransportUpdate(batchId: number, body: { location: string; temperature: number }, token: string) {
    return apiRequest<OwnershipHistoryDto>(`/batches/${batchId}/transport-updates`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  // Public trace endpoints (no auth)
  getBatchByCodePublic(batchCode: string) {
    return apiRequest<any>(`/batches/public/by-code/${encodeURIComponent(batchCode)}`);
  },
  getOwnershipHistoryByCodePublic(batchCode: string) {
    return apiRequest<OwnershipHistoryDto[]>(`/batches/public/by-code/${encodeURIComponent(batchCode)}/ownership-history`);
  },

  // QC OK automation (using recordBatchTransfer under the hood)
  qcOk(batchId: number, body: { toRole: string; toName: string; inspector: string }, token: string) {
    return apiRequest<OwnershipHistoryDto>(`/batches/${batchId}/qc-ok`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  register(email: string, password: string, role: string, walletAddress: string) {
    return apiRequest<AuthResponseDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role, walletAddress }),
    });
  },

  forgotPassword(email: string) {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, newPassword: string) {
    return apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },

  getProducts(token: string) {
    return apiRequest<ProductDto[]>("/products", { token });
  },

  getProduct(id: number, token: string) {
    return apiRequest<ProductDto>(`/products/${id}`, { token });
  },

  getOrders(token: string) {
    return apiRequest<OrderDto[]>("/orders", { token });
  },

  createOrder(params: { productId: number; quantity: number; shippingAddress?: string }, token: string) {
    return apiRequest<OrderDto>("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(params),
    });
  },

  getBatches(token: string) {
    return apiRequest<BatchDto[]>("/batches", { token });
  },

  getBatchSummaries(token: string) {
    return apiRequest<BatchSummaryDto[]>("/batches/me", { token });
  },

  getDashboardSummary(token: string) {
    return apiRequest<DashboardSummaryDto>("/dashboard/summary", { token });
  },

  uploadImage(file: File, token: string) {
    const form = new FormData();
    form.append("file", file);
    // Note: do NOT set Content-Type; browser will set boundary automatically.
    return apiRequest<{ url: string }>("/uploads/image", {
      method: "POST",
      token,
      body: form as any,
      // override headers: let apiRequest skip default JSON header
      headers: undefined,
    });
  },

  /**
   * Upload batch document (chứng từ) lên IPFS
   * @param formData - FormData chứa file
   * @param token - JWT token
   * @returns IPFS CID và SHA-256 hash
   */
  uploadBatchDocument(formData: FormData, token: string) {
    return apiRequest<{ ipfsCid: string; hashSha256: string; fileUrl: string }>("/uploads/batch-document", {
      method: "POST",
      token,
      body: formData as any,
      headers: undefined, // Let browser set Content-Type with boundary
    });
  },

  // Batch APIs
  createBatch(params: { 
    batchCode: string; 
    farmName: string; 
    harvestDate: string; 
    variety: string; 
    notes?: string; 
    ipfsCid?: string; 
    hashSha256?: string; 
  }, token: string) {
    return apiRequest<BatchDto>("/batches", {
      method: "POST",
      token,
      body: JSON.stringify(params),
    });
  },

  getBatch(id: number, token: string) {
    return apiRequest<BatchDto>(`/batches/${id}`, { token });
  },

  updateBatch(id: number, params: Partial<{
    farmName: string;
    harvestDate: string;
    variety: string;
    notes: string;
    ipfsCid: string;
    hashSha256: string;
  }>, token: string) {
    return apiRequest<BatchDto>(`/batches/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(params),
    });
  },

  // Product APIs
  createProduct(params: {
    name: string;
    description?: string;
    priceWei: string;
    stock: number;
    batchId: number;
    coverImageUrl?: string;
  }, token: string) {
    return apiRequest<ProductDto>("/products", {
      method: "POST",
      token,
      body: JSON.stringify(params),
    });
  },

  updateProduct(id: number, params: Partial<{
    name: string;
    description?: string;
    priceWei: string;
    stock: number;
    batchId: number;
    coverImageUrl?: string;
  }>, token: string) {
    return apiRequest<ProductDto>(`/products/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(params),
    });
  },

  deleteProduct(id: number, token: string) {
    return apiRequest<{ success: true }>(`/products/${id}`, {
      method: "DELETE",
      token,
    });
  },

  // Order APIs
  getOrder(id: number, token: string) {
    return apiRequest<OrderDto>(`/orders/${id}`, { token });
  },

  releaseOrder(id: number, token: string, connectedWallet?: string) {
    const headers: HeadersInit = connectedWallet
      ? { "x-wallet-address": connectedWallet }
      : undefined as any;
    return apiRequest<OrderDto>(`/orders/${id}/release`, {
      method: "POST",
      token,
      headers,
    });
  },

  cancelOrder(id: number, token: string) {
    return apiRequest<OrderDto>(`/orders/${id}/cancel`, {
      method: "POST",
      token,
    });
  },

  updateOrder(id: number, params: { quantity?: number; shippingAddress?: string }, token: string) {
    return apiRequest<OrderDto>(`/orders/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(params),
    });
  },

  // Đánh dấu đơn đã ký quỹ (sau khi thanh toán on-chain thành công)
  // Gửi kèm x-wallet-address để backend đối chiếu ví đang kết nối
  holdOrder(id: number, token: string, connectedWallet?: string) {
    const headers: HeadersInit = connectedWallet
      ? { "x-wallet-address": connectedWallet }
      : undefined as any;
    return apiRequest<OrderDto>(`/orders/${id}/hold`, {
      method: "POST",
      token,
      headers,
    });
  },

  // Batch verification
  verifyBatch(id: number, token: string) {
    return apiRequest<{
      anchored: boolean;
      verified: boolean;
      onChainHash?: string;
      message: string;
    }>(`/batches/${id}/verify`, { token });
  },

  // Review APIs
  createReview(productId: number, rating: number, comment: string | undefined, token: string) {
    return apiRequest<{
      id: number;
      productId: number;
      userId: number;
      rating: number;
      comment: string | null;
      createdAt: string;
    }>(`/products/${productId}/reviews`, {
      method: "POST",
      token,
      body: JSON.stringify({ rating, comment }),
    });
  },

  getProductReviews(productId: number, token?: string) {
    return apiRequest<Array<{
      id: number;
      productId: number;
      userId: number;
      rating: number;
      comment: string | null;
      createdAt: string;
      user?: { id: number; email: string };
    }>>(`/products/${productId}/reviews`, { token });
  },

  getProductRatingStats(productId: number, token?: string) {
    return apiRequest<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Array<{ rating: number; count: number }>;
    }>(`/products/${productId}/reviews/stats`, { token });
  },

  getMyReviews(token: string) {
    return apiRequest<Array<{
      id: number;
      productId: number;
      userId: number;
      rating: number;
      comment: string | null;
      createdAt: string;
    }>>("/reviews/me", { token });
  },

  deleteReview(id: number, token: string) {
    return apiRequest<{ message: string }>(`/reviews/${id}`, {
      method: "DELETE",
      token,
    });
  },

  // Admin APIs
  adminGetUsers(page: number, limit: number, role: string | undefined, token: string) {
    return apiRequest<{
      data: Array<{
        id: number;
        email: string;
        role: string;
        walletAddress: string;
        createdAt: string;
        _count: {
          products: number;
          buyerOrders: number;
          sellerOrders: number;
        };
      }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>("/admin/users", { token, searchParams: { page, limit, role } });
  },

  adminUpdateUserRole(userId: number, role: string, token: string) {
    return apiRequest<{ id: number; email: string; role: string }>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ role }),
    });
  },

  adminGetProducts(page: number, limit: number, token: string) {
    return apiRequest<{
      data: Array<any>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>("/admin/products", { token, searchParams: { page, limit } });
  },

  adminDeleteProduct(productId: number, token: string) {
    return apiRequest<{ message: string }>(`/admin/products/${productId}`, {
      method: "DELETE",
      token,
    });
  },

  adminGetOrders(page: number, limit: number, status: string | undefined, token: string) {
    return apiRequest<{
      data: Array<any>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>("/admin/orders", { token, searchParams: { page, limit, status } });
  },

  adminGetStats(token: string) {
    return apiRequest<{
      overview: {
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        totalBatches: number;
        totalReviews: number;
        totalRevenueWei: string;
      };
      usersByRole: Array<{ role: string; count: number }>;
      ordersByStatus: Array<{ status: string; count: number }>;
      recentOrders: Array<{
        id: number;
        buyerEmail: string;
        productName: string;
        totalWei: string;
        status: string;
        createdAt: string;
      }>;
    }>("/admin/stats", { token });
  },

  // Certification APIs
  createCertification(
    data: {
      batchId?: number;
      productId?: number;
      name: string;
      type: string;
      issuer: string;
      issueDate: string;
      expiryDate?: string;
      fileUrl: string;
      description?: string;
      verified?: boolean;
    },
    token: string
  ) {
    return apiRequest<{
      id: number;
      batchId: number | null;
      productId: number | null;
      name: string;
      type: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      fileUrl: string;
      description: string | null;
      verified: boolean;
      createdAt: string;
    }>("/certifications", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  getBatchCertifications(batchId: number, token?: string) {
    return apiRequest<Array<{
      id: number;
      batchId: number | null;
      productId: number | null;
      name: string;
      type: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      fileUrl: string;
      description: string | null;
      verified: boolean;
      createdAt: string;
    }>>(`/batches/${batchId}/certifications`, { token });
  },

  getProductCertifications(productId: number, token?: string) {
    return apiRequest<Array<{
      id: number;
      batchId: number | null;
      productId: number | null;
      name: string;
      type: string;
      issuer: string;
      issueDate: string;
      expiryDate: string | null;
      fileUrl: string;
      description: string | null;
      verified: boolean;
      createdAt: string;
    }>>(`/products/${productId}/certifications`, { token });
  },

  verifyCertification(id: number, verified: boolean, token: string) {
    return apiRequest<{
      id: number;
      verified: boolean;
    }>(`/certifications/${id}/verify`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ verified }),
    });
  },

  deleteCertification(id: number, token: string) {
    return apiRequest<{ message: string }>(`/certifications/${id}`, {
      method: "DELETE",
      token,
    });
  },

  // User APIs
  getProfile(token: string) {
    return apiRequest<import("@/types/api").UserDto>("/users/me", { token });
  },

  // Cấp nonce để ký xác minh đổi ví
  walletUpdateNonce(token: string) {
    return apiRequest<{ nonce: string }>("/users/wallet-update-nonce", {
      method: "POST",
      token,
    });
  },

  // Đổi ví: gửi newWallet và chữ ký từ ví cũ
  updateWallet(newWallet: string, signature: string, token: string) {
    return apiRequest<import("@/types/api").UserDto>("/users/update-wallet", {
      method: "POST",
      token,
      body: JSON.stringify({ newWallet, signature }),
    });
  },
};

export type ApiClient = typeof apiClient;
