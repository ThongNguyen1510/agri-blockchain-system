// src/components/layout/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Dashboard, Store, ShoppingCart, People, Gavel, History } from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

// --- BẮT ĐẦU SỬA LỖI ---

// 1. Định nghĩa kiểu cho một mục trong menu
interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

// Áp dụng kiểu MenuItem[] cho các mảng menu để tăng tính an toàn
const sellerMenu: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Quản lý Lô hàng', icon: <Store />, path: '/batches' },
  { text: 'Quản lý Sản phẩm', icon: <ShoppingCart />, path: '/products' },
];

const buyerMenu: MenuItem[] = [
    { text: 'Marketplace', icon: <Store />, path: '/' },
    { text: 'Đơn hàng của tôi', icon: <ShoppingCart />, path: '/my-orders' },
];

const adminMenu: MenuItem[] = [
    { text: 'Quản lý người dùng', icon: <People />, path: '/admin/users' },
    { text: 'Giải quyết tranh chấp', icon: <Gavel />, path: '/admin/disputes' },
    { text: 'Lịch sử hệ thống', icon: <History />, path: '/admin/audit' },
];


const Sidebar = () => {
  const { user } = useUserStore();

  // 2. Khai báo kiểu rõ ràng cho biến menuItems
  let menuItems: MenuItem[] = [];
  
  if (user?.role === 'Seller') menuItems = sellerMenu;
  if (user?.role === 'Buyer') menuItems = buyerMenu;
  if (user?.role === 'Admin') menuItems = adminMenu;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {/* TypeScript giờ đã biết `item` là một đối tượng `MenuItem` */}
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;