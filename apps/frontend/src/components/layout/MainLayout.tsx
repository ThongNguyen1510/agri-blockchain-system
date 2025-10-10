// src/components/layout/MainLayout.tsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

// --- BẮT ĐẦU SỬA LỖI ---

// 1. Định nghĩa kiểu cho props, bao gồm cả `children`
interface MainLayoutProps {
  children: React.ReactNode; // `children` có thể là bất cứ thứ gì React render được
}

// 2. Áp dụng kiểu `MainLayoutProps` cho component
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-content">
          {children} {/* Nội dung của từng trang sẽ được hiển thị ở đây */}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;