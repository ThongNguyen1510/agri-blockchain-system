import React from "react";
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { Dashboard, Store, ShoppingCart, People, Gavel, History } from "@mui/icons-material";
import Link from "next/link";
import { useUserStore } from "../../store/userStore";

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const sellerMenu: MenuItem[] = [
  { text: "Bảng điều khiển", icon: <Dashboard />, path: "/dashboard" },
  { text: "Lô hàng của tôi", icon: <Store />, path: "/seller/batches" },
  { text: "Chợ nông sản", icon: <ShoppingCart />, path: "/products" },
];

const buyerMenu: MenuItem[] = [
  { text: "Chợ nông sản", icon: <Store />, path: "/products" },
  { text: "Đơn hàng của tôi", icon: <ShoppingCart />, path: "/orders" },
];

const adminMenu: MenuItem[] = [
  { text: "Quản lý người dùng", icon: <People />, path: "/admin/users" },
  { text: "Xử lý tranh chấp", icon: <Gavel />, path: "/admin/disputes" },
  { text: "Nhật ký hệ thống", icon: <History />, path: "/admin/audit" },
];

const Sidebar = () => {
  const { user } = useUserStore();

  let menuItems: MenuItem[] = [];
  if (user?.role === "Seller") menuItems = sellerMenu;
  if (user?.role === "Buyer") menuItems = buyerMenu;
  if (user?.role === "Admin") menuItems = adminMenu;

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        ["& .MuiDrawer-paper"]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} passHref key={item.text} legacyBehavior>
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
