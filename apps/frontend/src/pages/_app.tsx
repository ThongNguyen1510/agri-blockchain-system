// src/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import '../styles/globals.css';

// --- BẮT ĐẦU THÊM MỚI ---
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { hardhat } from 'wagmi/chains'; // Mạng Hardhat local
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Cấu hình wagmi và RainbowKit
const config = getDefaultConfig({
  appName: 'AgroChain',
  projectId: '3a9ab5c77a91043223819f0d36fe53b8', // Thay bằng ID của bạn từ WalletConnect Cloud
  chains: [hardhat], // Chỉ định mạng chúng ta sẽ dùng
  ssr: true, // Bật Server-Side Rendering cho Next.js
});

const queryClient = new QueryClient();
// --- KẾT THÚC THÊM MỚI ---

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // Bọc toàn bộ ứng dụng trong các Provider
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;