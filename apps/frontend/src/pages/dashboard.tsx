import { Alert, Box, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import StatCard from "../components/dashboard/StatCard";
import SalesChart from "../components/dashboard/SalesChart";
import RecentOrdersTable from "../components/dashboard/RecentOrdersTable";
import { useProtectedRoute } from "../lib/useProtectedRoute";
import { useDashboardSummary } from "../lib/hooks/useDashboardSummary";

const DashboardPage = () => {
  const { user, token, checking } = useProtectedRoute();
  const { data, isLoading, isError } = useDashboardSummary(token);

  if (checking || !user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const stats = data?.stats ?? {
    totalOrders: 0,
    activeEscrows: 0,
    releasedVolumeEth: "0.0000",
    disputes: 0,
  };

  const sales = data?.sales ?? [];
  const recentOrders = data?.recentOrders ?? [];

  const statItems = [
    { title: "Tổng đơn hàng", value: stats.totalOrders },
    { title: "Đơn đang ký quỹ", value: stats.activeEscrows },
    { title: "Đã giải ngân (ETH)", value: stats.releasedVolumeEth },
    { title: "Tranh chấp", value: stats.disputes },
  ];

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Bảng điều khiển
        </Typography>

        {isError && <Alert severity="error">Không thể tải dữ liệu dashboard. Vui lòng thử lại.</Alert>}

        <Grid container spacing={3}>
          {statItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <StatCard title={item.title} value={item.value} />
            </Grid>
          ))}
        </Grid>

        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <SalesChart data={sales} />
          )}
        </Box>

        <Box>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <RecentOrdersTable orders={recentOrders} />
          )}
        </Box>
      </Stack>
    </MainLayout>
  );
};

export default DashboardPage;
