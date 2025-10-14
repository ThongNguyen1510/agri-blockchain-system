import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export interface RecentOrderRow {
  id: number;
  productName: string;
  totalEth: string;
  status: "Held" | "Released" | "Refunded" | "Disputed" | string;
  createdAt: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrderRow[];
}

const statusLabel = (status: string) => {
  if (status === "Held") return "Đang ký quỹ";
  if (status === "Released") return "Đã giải ngân";
  if (status === "Refunded") return "Đã hoàn tiền";
  if (status === "Disputed") return "Tranh chấp";
  return status;
};

const statusChipColor = (status: string) => {
  if (status === "Held") return "warning" as const;
  if (status === "Released") return "success" as const;
  if (status === "Disputed") return "error" as const;
  return "default" as const;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString("vi-VN");

const RecentOrdersTable = ({ orders }: RecentOrdersTableProps) => (
  <TableContainer component={Paper}>
    <Typography variant="h6" sx={{ p: 2 }}>
      Đơn hàng gần đây
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Mã đơn</TableCell>
          <TableCell>Sản phẩm</TableCell>
          <TableCell>Giá trị (ETH)</TableCell>
          <TableCell>Ngày tạo</TableCell>
          <TableCell>Trạng thái</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.productName}</TableCell>
            <TableCell>{order.totalEth}</TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell>
              <Chip label={statusLabel(order.status)} color={statusChipColor(order.status)} size="small" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default RecentOrdersTable;
