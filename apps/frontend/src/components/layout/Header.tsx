import { AppBar, Toolbar, Typography, Button, Box, Stack } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserStore } from "../../store/userStore";

const Header = () => {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: "1px solid rgba(46,125,50,0.12)" }}>
      <Toolbar sx={{ display: "flex", gap: 3 }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}
        >
          AgroChain Marketplace
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <ConnectButton chainStatus="icon" showBalance={false} />
        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {user.email} ({user.role})
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/login">
              Đăng nhập
            </Button>
            <Button component={Link} href="/register" variant="contained">
              Đăng ký
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
