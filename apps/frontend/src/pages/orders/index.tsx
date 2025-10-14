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
  Link as MuiLink,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import MainLayout from "../../components/layout/MainLayout";
import { buyerOrdersMock } from "../../lib/mockProducts";
import { useProtectedRoute } from "../../lib/useProtectedRoute";

const statusColor = (status: string) => {
  if (status === "Held") return "warning" as const;
  if (status === "Released") return "success" as const;
  if (status === "Refunded") return "default" as const;
  if (status === "Disputed") return "error" as const;
  return "default" as const;
};

const OrdersPage = () => {
  const { checking, allowed } = useProtectedRoute({ roles: ["Buyer", "Seller"] });

  if (checking || !allowed) {
    return null;
  }

  return (
    <MainLayout>
      <Head>
        <title>Đơn hàng của tôi | AgroChain</title>
      </Head>
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Đơn hàng của tôi
        </Typography>
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Người bán</TableCell>
                  <TableCell align="right">Giá trị (ETH)</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell>Giao dịch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {buyerOrdersMock.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      <MuiLink component={Link} href={/product/} underline="hover">
                        {order.productName}
                      </MuiLink>
                    </TableCell>
                    <TableCell>{order.sellerName}</TableCell>
                    <TableCell align="right">{order.totalEth.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Chip label={order.status} color={statusColor(order.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {order.txHash ? (
                        <MuiLink
                          href={https://sepolia.etherscan.io/tx/}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                        >
                          {order.txHash.slice(0, 10)}…
                        </MuiLink>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Đang chờ giải ngân
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
};

export default OrdersPage;
