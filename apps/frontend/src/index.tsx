// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import './styles/global.css';

// --- BẮT ĐẦU SỬA LỖI ---

// Thêm dấu `!` ở cuối để khẳng định với TypeScript rằng phần tử 'root' chắc chắn tồn tại
const root = ReactDOM.createRoot(
  document.getElementById('root')! 
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);