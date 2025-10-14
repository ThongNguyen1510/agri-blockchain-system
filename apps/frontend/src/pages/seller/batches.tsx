import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { useProtectedRoute } from "../../lib/useProtectedRoute";
import { useSellerBatches } from "../../lib/hooks/useSellerBatches";
import { apiFetch } from "../../lib/apiClient";

const STATUS_FILTERS = ["Tất cả", "Đang bán", "Đã khóa", "Nháp"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SellerBatchesPage = () => {
  const { checking, allowed, token, user } = useProtectedRoute({ roles: ["Seller", "Admin"] });
  const { data, isLoading, refetch } = useSellerBatches(token);

  const [productName, setProductName] = useState("");
  const [quantityNote, setQuantityNote] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [hashSha256, setHashSha256] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tất cả");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const batches = data ?? [];

  const filteredBatches = useMemo(() => {
    if (statusFilter === "Tất cả") return batches;
    return batches.filter((batch) => batch.status === statusFilter);
  }, [batches, statusFilter]);

  if (checking || !allowed || !user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setFormError(null);
    setFormSuccess(null);

    if (!productName.trim()) {
      setFormError("Vui lòng nhập tên sản phẩm");
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/batches", {
        method: "POST",
        token,
        body: {
          productName: productName.trim(),
          quantityNote: quantityNote.trim() || undefined,
          harvestDate: harvestDate || undefined,
          ipfsCid: ipfsCid.trim() || undefined,
          hashSha256: hashSha256.trim() || undefined,
        },
      });
      setProductName("");
      setQuantityNote("");
      setHarvestDate("");
      setIpfsCid("");
      setHashSha256("");
      setFormSuccess("Tạo lô hàng thành công.");
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo lô hàng. Vui lòng thử lại.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Head>
        <title>Seller | Quản lý lô hàng</title>
      </Head>
      <Stack spacing={4} sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý lô hàng
        </Typography>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Tạo lô hàng mới
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Tên sản phẩm"
                    fullWidth
                    required
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="Ví dụ: Sầu riêng Ri6"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Sản lượng / ghi chú"
                    fullWidth
                    value={quantityNote}
                    onChange={(event) => setQuantityNote(event.target.value)}
                    placeholder="1,2 tấn"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Ngày thu hoạch"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={harvestDate}
                    onChange={(event) => setHarvestDate(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="IPFS CID"
                    fullWidth
                    value={ipfsCid}
                    onChange={(event) => setIpfsCid(event.target.value)}
                    placeholder="bafy..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Hash truy xuất"
                    fullWidth
                    value={hashSha256}
                    onChange={(event) => setHashSha256(event.target.value)}
                    placeholder="0xabc123"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack spacing={1.5}>
                    {formError && <Alert severity="error">{formError}</Alert>}
                    {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" size="large" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Lưu lô hàng"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Lô hàng gần đây
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Các lô hàng bạn đã tạo và trạng thái cung ứng hiện tại.
                </Typography>
              </Box>
              <TextField
                select
                size="small"
                label="Lọc trạng thái"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                {STATUS_FILTERS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack spacing={2}>
              {isLoading && <Typography color="text.secondary">Đang tải dữ liệu...</Typography>}
              {!isLoading && filteredBatches.length === 0 && (
                <Typography color="text.secondary">Bạn chưa có lô hàng nào.</Typography>
              )}
              {filteredBatches.map((batch) => (
                <Card
                  key={batch.id}
                  variant="outlined"
                  sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}
                >
                  <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {batch.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mã batch: {batch.batchCode}
                        </Typography>
                        {batch.harvestDate && (
                          <Typography variant="body2" color="text.secondary">
                            Ngày thu hoạch: {new Date(batch.harvestDate).toLocaleDateString("vi-VN")}
                          </Typography>
                        )}
                        {batch.quantityNote && (
                          <Typography variant="body2" color="text.secondary">
                            Sản lượng: {batch.quantityNote}
                          </Typography>
                        )}
                        {batch.ipfsCid && (
                          <Typography variant="body2" color="text.secondary">
                            CID: {batch.ipfsCid}
                          </Typography>
                        )}
                      </Box>
                      <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                        <Chip
                          label={batch.status}
                          color={batch.status === "Đang bán" ? "success" : batch.status === "Nháp" ? "default" : "warning"}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Tạo lúc: {new Date(batch.createdAt).toLocaleString("vi-VN")}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
};

export default SellerBatchesPage;
