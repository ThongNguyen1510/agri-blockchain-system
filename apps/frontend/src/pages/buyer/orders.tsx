import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Head from "next/head";
import MainLayout from "../../components/layout/MainLayout";
import { recentOrders } from "../../lib/dummyData";
import { useProtectedRoute } from "../../lib/useProtectedRoute";

const BuyerOrdersPage = () => {
  const { checking, allowed, user } = useProtectedRoute({ roles: ["Buyer", "Seller"] });

  if (checking || !allowed) {
    return null;
  }

  const orders = user?.role === "Buyer"
    ? recentOrders.filter((order) => order.buyer.toLowerCase().includes("buyer"))
    : recentOrders;

  return (
    <MainLayout title="Đơn hàng của tôi">
      <Head>
        <title>Buyer | Đơn hàng</title>
      </Head>
      <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Tình trạng ký quỹ
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell align="right">Giá trị</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.seller}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell align="right">{order.value}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.status}
                      size="small"
                      color={order.status === "Escrow" ? "warning" : order.status === "Released" ? "success" : "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default BuyerOrdersPage;
