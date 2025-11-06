import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Calendar, MapPin, FileText, Copy, ExternalLink, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import type { BatchSummaryDto } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { CertificationsList } from "@/components/CertificationsList";

const Trace = () => {
  const { batchId } = useParams<{ batchId?: string }>();
  const { token } = useAuth();
  const [searchBatch, setSearchBatch] = useState(batchId ?? "");
  const [selectedBatch, setSelectedBatch] = useState<BatchSummaryDto | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{
    loading: boolean;
    result?: { anchored: boolean; verified: boolean; onChainHash?: string; message: string };
  }>({ loading: false });

  const {
    data: batches,
    isLoading,
    error,
  } = useQuery<BatchSummaryDto[], Error>({
    queryKey: ["batches", "me"],
    queryFn: () => apiClient.getBatchSummaries(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });

  const sortedBatches = useMemo(() => {
    if (!batches?.length) {
      return [];
    }
    return [...batches].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }, [batches]);

  useEffect(() => {
    if (batchId) {
      setSearchBatch(batchId);
    }
  }, [batchId]);

  useEffect(() => {
    if (batchId && sortedBatches.length) {
      const found = sortedBatches.find(
        (item) => item.batchCode.toLowerCase() === batchId.toLowerCase(),
      );
      if (found) {
        setSelectedBatch(found);
      }
    }
  }, [batchId, sortedBatches]);

  const handleSearch = () => {
    const trimmed = searchBatch.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập mã lô hàng.");
      setSelectedBatch(null);
      return;
    }

    if (!sortedBatches.length) {
      toast.error("Chưa có dữ liệu lô hàng.");
      return;
    }

    const result = sortedBatches.find(
      (item) => item.batchCode.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!result) {
      toast.error("Không tìm thấy lô hàng. Kiểm tra mã và thử lại.");
      setSelectedBatch(null);
      return;
    }

    setSelectedBatch(result);
    toast.success("Đã tải thông tin lô hàng.");
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Đã sao chép ${label} vào bộ nhớ tạm`);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  const handleVerifyBlockchain = async () => {
    if (!selectedBatch || !token) return;
    
    setVerificationStatus({ loading: true });
    try {
      const result = await apiClient.verifyBatch(selectedBatch.id, token);
      setVerificationStatus({ loading: false, result });
      
      if (result.verified) {
        toast.success("Xác thực blockchain thành công!");
      } else if (result.anchored) {
        toast.warning("Batch đã anchor nhưng hash không khớp");
      } else {
        toast.info("Batch chưa được anchor lên blockchain");
      }
    } catch (error) {
      setVerificationStatus({ loading: false });
      toast.error("Không thể xác thực blockchain");
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
          Không thể tải danh sách lô hàng: {error.message}
        </div>
      );
    }

    if (!selectedBatch) {
      return (
        <div className="rounded-lg border border-muted bg-muted/20 p-10 text-center text-muted-foreground">
          Nhập mã lô hàng để xem thông tin xác thực trên blockchain.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 text-xl font-bold text-primary">Lô hàng đã xác minh trên blockchain</h3>
              <p className="text-sm text-muted-foreground">
                Dữ liệu bất biến trên blockchain đảm bảo tính xác thực và truy xuất nguồn gốc.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Thông tin lô hàng</h3>
              <Badge className="gap-1 bg-primary">
                <ShieldCheck className="h-3 w-3" />
                Da xac minh
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between border-b py-2">
                <span className="text-sm text-muted-foreground">Mã lô hàng</span>
                <span className="font-mono font-semibold text-primary">{selectedBatch.batchCode}</span>
              </div>
              <div className="flex items-start justify-between border-b py-2">
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Sản phẩm
                </span>
                <span className="text-right font-semibold">{selectedBatch.productName}</span>
              </div>
              <div className="flex items-start justify-between border-b py-2">
                <span className="text-sm text-muted-foreground">Ngày thu hoạch</span>
                <span className="font-semibold">{formatDate(selectedBatch.harvestDate)}</span>
              </div>
              <div className="flex items-start justify-between border-b py-2">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge variant="outline">{selectedBatch.status}</Badge>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="text-sm text-muted-foreground">Ngày tạo</span>
                <span className="font-semibold">{formatDate(selectedBatch.createdAt)}</span>
              </div>
            </div>

            {selectedBatch.quantityNote && (
              <div className="rounded-md border border-muted bg-muted/10 p-3 text-sm text-muted-foreground">
                {selectedBatch.quantityNote}
              </div>
            )}
          </Card>

          <Card className="space-y-4 p-6">
            <h3 className="text-xl font-semibold">Mã QR</h3>
            <div className="flex items-center justify-center rounded-lg bg-white p-6">
              <QRCode value={selectedBatch.batchCode} size={200} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Quét mã để chia sẻ thông tin truy xuất cho đối tác và khách hàng.
            </p>
          </Card>
        </div>

        <Card className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Tham chiếu blockchain</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IPFS CID</span>
                {selectedBatch.ipfsCid && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedBatch.ipfsCid!, "IPFS CID")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 font-mono text-sm">
                {selectedBatch.ipfsCid ?? "Chưa cập nhật"}
              </div>
              
              {/* Nút xem tài liệu nếu có documentUrl */}
              {(() => {
                const docUrl = (selectedBatch as any).documentUrl;
                console.log('Batch documentUrl:', docUrl);
                console.log('Full batch data:', selectedBatch);
                
                return docUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 gap-2"
                    onClick={() => window.open(docUrl, "_blank")}
                  >
                    <FileText className="h-4 w-4" />
                    Xem tài liệu lô hàng
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Lô hàng này chưa có tài liệu đính kèm
                  </p>
                );
              })()}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SHA-256 hash</span>
                {selectedBatch.hashSha256 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedBatch.hashSha256!, "Hash")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="rounded-lg bg-secondary/50 p-3 font-mono text-sm">
                {selectedBatch.hashSha256 ?? "Chưa cập nhật"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleVerifyBlockchain}
              disabled={verificationStatus.loading || !selectedBatch.hashSha256}
            >
              <ShieldCheck className="h-4 w-4" />
              {verificationStatus.loading ? "Đang xác thực..." : "Xác thực trên Blockchain"}
            </Button>

            {verificationStatus.result && (
              <div className={`rounded-lg border p-4 ${
                verificationStatus.result.verified
                  ? "border-green-500/50 bg-green-500/10"
                  : verificationStatus.result.anchored
                  ? "border-yellow-500/50 bg-yellow-500/10"
                  : "border-gray-500/50 bg-gray-500/10"
              }`}>
                <div className="flex items-start gap-3">
                  {verificationStatus.result.verified ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : verificationStatus.result.anchored ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{verificationStatus.result.message}</p>
                    {verificationStatus.result.onChainHash && (
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        On-chain hash: {verificationStatus.result.onChainHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedBatch.hashSha256 && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() =>
                  window.open(`https://etherscan.io/search?q=${selectedBatch.hashSha256}`, "_blank", "noopener")
                }
              >
                Xem trên block explorer
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Hiển thị chứng nhận nếu có batch được chọn */}
        {selectedBatch && (
          <div className="mt-8">
            <CertificationsList batchId={selectedBatch.id} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold">Truy xuất nguồn gốc</h1>
            <p className="text-lg text-muted-foreground">
              Kiểm chứng bằng chứng on-chain và chữ ký số cho từng lô nông sản.
            </p>
          </div>

          <Card className="mb-8 p-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                placeholder="Nhập mã lô (ví dụ: BATCH-2025-001)"
                value={searchBatch}
                onChange={(event) => setSearchBatch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="gap-2 bg-gradient-hero hover:opacity-90">
                <Search className="h-4 w-4" />
                Tra cứu
              </Button>
            </div>
          </Card>

          {renderResult()}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Trace;
