// src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng người dùng đến trang /login
    router.replace('/login');
  }, [router]);

  // Hiển thị một thông báo tải trang trong khi chuyển hướng
  return <div>Loading...</div>;
};

export default HomePage;