// src/components/layout/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Dashboard, Store, ShoppingCart, People, Gavel, History } from '@mui/icons-material';
import { useUserStore } from '../../store/userStore';
import Link from 'next/link'; // Use the correct Link component from Next.js

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const sellerMenu: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Quản lý Lô hàng', icon: <Store />, path: '/batches' },
  { text: 'Quản lý Sản phẩm', icon: <ShoppingCart />, path: '/products' },
  { text: 'Quản lý Đơn hàng', icon: <ShoppingCart />, path: '/orders' },
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
        {menuItems.map((item) => (
          // Use the Next.js Link component pattern
          <Link href={item.path} passHref key={item.text}>
            <ListItem component="a" disablePadding>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;