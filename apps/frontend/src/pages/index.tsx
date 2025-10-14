import { Box, Button, Container, Grid, Stack, Typography, Card, CardContent } from "@mui/material";
import Link from "next/link";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const featureCards = [
  {
    title: "Niêm yết minh bạch",
    description:
      "Mỗi lô hàng được gắn với CID/IPFS và chữ ký số, đảm bảo thông tin truy xuất rõ ràng cho người mua.",
  },
  {
    title: "Escrow tự động",
    description:
      "Hợp đồng thông minh giữ tiền ký quỹ và chỉ giải ngân khi điều kiện giao hàng được xác nhận đầy đủ.",
  },
  {
    title: "Theo dõi vận chuyển",
    description:
      "Dashboard trực quan cập nhật trạng thái lô hàng, nhiệt độ kho và dấu vết vận chuyển theo thời gian thực.",
  },
];

const metrics = [
  { value: "78+", label: "Lô hàng đang hoạt động" },
  { value: "1.9 ETH", label: "Giá trị escrow trong 7 ngày" },
  { value: "24", label: "Đối tác đang giao dịch" },
];

const roleHighlights = [
  {
    title: "Seller",
    body: "Quản lý batch, cập nhật chứng nhận và theo dõi tiến độ ký quỹ cho từng đơn hàng.",
    cta: "Tạo tài khoản Seller",
    href: "/register?role=seller",
  },
  {
    title: "Buyer",
    body: "Đặt hàng an toàn, theo dõi vận chuyển và yêu cầu giải ngân ngay khi sản phẩm đạt chuẩn.",
    cta: "Khám phá sản phẩm",
    href: "/register?role=buyer",
  },
  {
    title: "Admin",
    body: "Giám sát toàn hệ thống, phê duyệt Seller mới và xử lý các tranh chấp escrow.",
    cta: "Đăng nhập quản trị",
    href: "/login",
  },
];

const HomePage = () => {
  return (
    <>
      <Head>
        <title>AgroChain Marketplace</title>
      </Head>
      <Box sx={{ background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #ffffff 100%)", minHeight: "100vh" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Typography variant="overline" color="success.main" fontWeight={700} letterSpacing={2}>
                  Nền tảng blockchain cho nông sản
                </Typography>
                <Typography variant="h3" component="h1" fontWeight={700}>
                  Quản lý và giao dịch nông sản minh bạch cùng AgroChain
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Nền tảng dành cho hợp tác xã, nông hộ và nhà nhập khẩu. Tạo batch với dữ liệu nguồn gốc, ký quỹ an toàn bằng hợp đồng escrow và xây dựng niềm tin với đối tác quốc tế.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button component={Link} href="/register" variant="contained" size="large">
                    Đăng ký tài khoản
                  </Button>
                  <Button component={Link} href="/login" variant="outlined" size="large">
                    Đăng nhập
                  </Button>
                </Stack>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 2,
                    border: "1px solid rgba(46,125,50,0.2)",
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    bgcolor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(6px)",
                    width: "fit-content",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Kết nối ví để trải nghiệm đầy đủ:
                  </Typography>
                  <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {featureCards.map((item) => (
                  <Card
                    key={item.title}
                    elevation={0}
                    sx={{
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: 4,
                      border: "1px solid rgba(46,125,50,0.15)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>

        <Box sx={{ bgcolor: "#ffffff", py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {metrics.map((metric) => (
                <Grid item xs={12} md={4} key={metric.label}>
                  <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h4" fontWeight={700}>
              Chọn vai trò để bắt đầu
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              AgroChain cung cấp bảng điều khiển riêng cho từng loại người dùng. Đăng ký để tham gia vào hệ sinh thái ngay hôm nay.
            </Typography>
          </Stack>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {roleHighlights.map((role) => (
              <Grid item xs={12} md={4} key={role.title}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px solid rgba(46,125,50,0.12)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {role.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.body}
                    </Typography>
                    <Button
                      component={Link}
                      href={role.href}
                      variant="contained"
                      color="primary"
                      sx={{ mt: "auto" }}
                    >
                      {role.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
