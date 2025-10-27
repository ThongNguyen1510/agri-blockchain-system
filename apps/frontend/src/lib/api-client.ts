import type {
  AuthResponseDto,
  BatchDto,
  BatchSummaryDto,
  DashboardSummaryDto,
  OrderDto,
  ProductDto,
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

  const requestHeaders = new Headers(headers);
  if (body && !requestHeaders.has("Content-Type")) {
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

  register(email: string, password: string, role: string, walletAddress: string) {
    return apiRequest<AuthResponseDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role, walletAddress }),
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

  releaseOrder(id: number, token: string) {
    return apiRequest<OrderDto>(`/orders/${id}/release`, {
      method: "POST",
      token,
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
  holdOrder(id: number, token: string) {
    return apiRequest<OrderDto>(`/orders/${id}/hold`, {
      method: "POST",
      token,
    });
  },

  // User APIs
  getProfile(token: string) {
    return apiRequest<import("@/types/api").UserDto>("/users/me", { token });
  },
};

export type ApiClient = typeof apiClient;
