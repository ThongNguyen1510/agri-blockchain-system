import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ApiError, apiFetch } from "../lib/apiClient";
import { useUserStore, User } from "../store/userStore";

interface AuthResponse {
  accessToken: string;
  user: User;
}

const LoginPage = () => {
  const router = useRouter();
  const { user: currentUser, setUser } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { accessToken, user } = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setUser(user, accessToken);
      router.replace("/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? mapLoginError(err.message)
          : "Đăng nhập thất bại. Vui lòng thử lại.";
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
        sx={{ width: "100%", maxWidth: 420, borderRadius: 4, border: "1px solid rgba(46,125,50,0.08)" }}
      >
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={700}>
                Đăng nhập
              </Typography>
              <Typography color="text.secondary">
                Sử dụng tài khoản đã đăng ký để truy cập bảng điều khiển AgroChain.
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
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
                  autoComplete="current-password"
                />
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{" "}
              <MuiLink component={Link} href="/register" underline="hover">
                Đăng ký ngay
              </MuiLink>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

function mapLoginError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid credentials")) {
    return "Email hoặc mật khẩu không đúng.";
  }
  return message;
}

export default LoginPage;
