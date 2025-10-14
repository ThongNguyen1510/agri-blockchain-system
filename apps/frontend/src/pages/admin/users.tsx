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
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { adminUsers } from "../../lib/dummyData";
import { useProtectedRoute } from "../../lib/useProtectedRoute";

const AdminUsersPage = () => {
  const { checking, allowed } = useProtectedRoute({ roles: ["Admin"] });
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const input = query.trim().toLowerCase();
    if (!input) return adminUsers;
    return adminUsers.filter((user) => user.email.toLowerCase().includes(input));
  }, [query]);

  if (checking || !allowed) {
    return null;
  }

  return (
    <MainLayout title="Quản trị người dùng">
      <Head>
        <title>Admin | Người dùng</title>
      </Head>
      <Stack spacing={3}>
        <TextField
          label="Tìm kiếm người dùng"
          placeholder="Nhập email..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ maxWidth: 320 }}
        />
        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Danh sách tài khoản
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Lần đăng nhập cuối</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === "Active" ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
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

export default AdminUsersPage;
