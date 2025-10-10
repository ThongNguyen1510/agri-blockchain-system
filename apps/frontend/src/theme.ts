// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Chế độ sáng
    primary: {
      main: '#2e7d32', // Màu xanh lá cây đậm làm màu chính
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#ff8f00', // Màu cam/vàng làm màu phụ (cho các nút hành động, thông báo)
      light: '#ffc046',
      dark: '#c56000',
    },
    background: {
      default: '#f4f6f8', // Màu nền mặc định
      paper: '#ffffff',   // Màu nền cho các component như Card, Paper
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // Tùy chỉnh mặc định cho một số component
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bo góc nút
          textTransform: 'none', // Không viết hoa toàn bộ chữ trong nút
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bo góc Card
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Đổ bóng nhẹ nhàng
        },
      },
    },
  },
});

export default theme;