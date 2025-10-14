import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import MainLayout from "../../components/layout/MainLayout";
import { batchesTraceMock } from "../../lib/mockProducts";

const TraceDetailPage = () => {
  const router = useRouter();
  const { batchId } = router.query;
  const batch = batchesTraceMock.find((item) => item.batchId === batchId);

  if (!batch) {
    return (
      <MainLayout>
        <Box sx={{ px: 3, py: 6 }}>
          <Typography variant="h5">Không tìm thấy thông tin lô hàng.</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Head>
        <title>Truy xuất {batch.batchId} | AgroChain</title>
      </Head>
      <Stack spacing={3} sx={{ px: 3, py: 2 }}>
        <Typography variant="h4" fontWeight={700}>
          Truy xuất lô hàng {batch.batchId}
        </Typography>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thông tin sản phẩm
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {batch.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nông trại: {batch.farmName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giống: {batch.variety}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ngày thu hoạch: {new Date(batch.harvestDate).toLocaleDateString("vi-VN")}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dữ liệu on-chain
                  </Typography>
                  <MuiLink href={https://ipfs.io/ipfs/} target="_blank" underline="hover">
                    CID: {batch.ipfsCid}
                  </MuiLink>
                  <Typography variant="body2" color="text.secondary">
                    Hash: {batch.hashSha256}
                  </Typography>
                  <MuiLink
                    href={https://sepolia.etherscan.io/tx/}
                    target="_blank"
                    underline="hover"
                  >
                    Giao dịch neo: {batch.anchorTxHash.slice(0, 14)}…
                  </MuiLink>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(46,125,50,0.12)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Chứng chỉ đính kèm
            </Typography>
            <Stack spacing={1}>
              {batch.certificates.map((file) => (
                <Chip
                  key={file.url}
                  label={file.name}
                  component={MuiLink}
                  href={file.url}
                  target="_blank"
                  clickable
                  sx={{ maxWidth: 320 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
};

export default TraceDetailPage;
