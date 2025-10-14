import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ApiError, apiFetch } from "../lib/apiClient";
import { useUserStore, User } from "../store/userStore";

type RoleOption = "Seller" | "Buyer";

interface AuthResponse {
  accessToken: string;
  user: User;
}

const RegisterPage = () => {
  const router = useRouter();
  const { user: currentUser, setUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<RoleOption>("Buyer");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (router.query.role === "seller" || router.query.role === "Seller") {
      setRole("Seller");
    }
  }, [router.query.role]);

  useEffect(() => {
    if (currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  const isFormValid = useMemo(() => {
    return Boolean(email && password && confirmPassword && walletAddress);
  }, [email, password, confirmPassword, walletAddress]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { accessToken, user } = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: { email, password, role, walletAddress },
      });
      setUser(user, accessToken);
      setSuccess("Đăng ký thành công! Đang chuyển đến dashboard...");
      setTimeout(() => router.replace("/dashboard"), 1200);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Đăng ký thất bại. Vui lòng thử lại.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f6f8",
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{ width: "100%", maxWidth: 520, borderRadius: 4, border: "1px solid rgba(46,125,50,0.08)" }}
      >
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700}>
                Tạo tài khoản AgroChain
              </Typography>
              <Typography color="text.secondary">
                Chọn vai trò phù hợp để sử dụng đầy đủ các tính năng Seller hoặc Buyer.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  fullWidth
                  autoComplete="email"
                />
                <TextField
                  label="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Nhập lại mật khẩu"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Địa chỉ ví"
                  value={walletAddress}
                  onChange={(event) => setWalletAddress(event.target.value)}
                  placeholder="0x..."
                  required
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Vai trò</InputLabel>
                  <Select
                    labelId="role-select-label"
                    label="Vai trò"
                    value={role}
                    onChange={(event) => setRole(event.target.value as RoleOption)}
                  >
                    <MenuItem value="Buyer">Người mua (Buyer)</MenuItem>
                    <MenuItem value="Seller">Người bán (Seller)</MenuItem>
                  </Select>
                </FormControl>

                <Button type="submit" variant="contained" size="large" disabled={isSubmitting || !isFormValid}>
                  {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{" "}
              <MuiLink component={Link} href="/login" underline="hover">
                Đăng nhập ngay
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
