// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

// --- BẮT ĐẦU SỬA LỖI ---

// 1. Định nghĩa một kiểu cho các vai trò người dùng có thể có
type UserRole = 'Admin' | 'Seller' | 'Buyer';

// 2. Định nghĩa kiểu cho props của component
interface ProtectedRouteProps {
  allowedRoles: UserRole[]; // allowedRoles là một mảng các UserRole
}

// 3. Áp dụng kiểu `ProtectedRouteProps` cho component
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useUserStore();

  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra xem vai trò của người dùng có nằm trong danh sách được phép hay không
  const isAllowed = allowedRoles.includes(user.role as UserRole);

  if (!isAllowed) {
    // Nếu không được phép, có thể chuyển hướng về trang chủ hoặc trang "cấm truy cập"
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu hợp lệ, cho phép hiển thị nội dung của route
  return <Outlet />;
};

export default ProtectedRoute;