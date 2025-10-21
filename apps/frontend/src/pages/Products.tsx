import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { ProductDto } from "@/types/api";

const getCategory = (product: ProductDto) => product.batch?.variety ?? "Khác";
const getSellerName = (product: ProductDto) => product.seller?.email ?? "Chưa rõ người bán";

const Products = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const {
    data: products,
    isLoading,
    error,
  } = useQuery<ProductDto[], Error>({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    setCategory("all");
  }, [token]);

  const categories = useMemo(() => {
    if (!products?.length) {
      return [];
    }
    const unique = new Set<string>();
    for (const product of products) {
      unique.add(getCategory(product));
    }
    return Array.from(unique);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products?.length) {
      return [];
    }
    return products.filter((product) => {
      const keyword = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        getSellerName(product).toLowerCase().includes(keyword) ||
        product.batch?.batchCode?.toLowerCase().includes(keyword);
      const matchesCategory = category === "all" || getCategory(product) === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, category]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[360px] w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          Không thể tải danh sách sản phẩm: {error.message}
        </div>
      );
    }

    if (!filteredProducts.length) {
      return (
        <div className="rounded-lg border border-muted bg-muted/30 p-10 text-center text-muted-foreground">
          Không có sản phẩm phù hợp. Hãy điều chỉnh từ khóa hoặc danh mục.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">Chợ nông sản AgroChain</h1>
          <p className="text-lg text-muted-foreground">
            Khám phá nông sản được chứng thực trên blockchain từ các nhà cung cấp đáng tin cậy.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên sản phẩm, nhà cung cấp hoặc mã lô..."
              className="pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setSearchQuery("");
              setCategory("all");
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Đặt lại bộ lọc
          </Button>
        </div>

        {renderContent()}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
