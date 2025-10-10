// src/pages/_dummyData.ts

// 1. Import kiểu `Order` từ component của nó
import { Order } from '../components/dashboard/RecentOrdersTable';
import { ChartDataPoint } from '../components/dashboard/SalesChart'; // Giả sử bạn cũng đã export ChartDataPoint

// 2. Áp dụng kiểu `Order[]` cho biến dummyOrders
export const dummyOrders: Order[] = [
  { 
    id: 1024, 
    product: 'Sầu riêng Ri6 (Loại 1)', 
    total: '0.15 ETH', 
    status: 'Held', // Kiểu dữ liệu giờ đây được kiểm tra nghiêm ngặt
    date: '2025-10-10' 
  },
  { 
    id: 1023, 
    product: 'Vải thiều Lục Ngạn', 
    total: '0.05 ETH', 
    status: 'Released', 
    date: '2025-10-09' 
  },
  { 
    id: 1022, 
    product: 'Cam sành Hàm Yên', 
    total: '0.20 ETH', 
    status: 'Released', 
    date: '2025-10-08' 
  },
  { 
    id: 1021, 
    product: 'Thanh long Bình Thuận', 
    total: '0.08 ETH', 
    status: 'Disputed', 
    date: '2025-10-07' 
  },
  { 
    id: 1020, 
    product: 'Bưởi da xanh Bến Tre', 
    total: '0.12 ETH', 
    status: 'Refunded', 
    date: '2025-10-06' 
  },
];


// Tương tự, bạn cũng nên áp dụng kiểu cho dummyChartData
export const dummyChartData: ChartDataPoint[] = [
    { name: 'Tháng 5', doanhthu: 4000 },
    { name: 'Tháng 6', doanhthu: 3000 },
    { name: 'Tháng 7', doanhthu: 2000 },
    { name: 'Tháng 8', doanhthu: 2780 },
    { name: 'Tháng 9', doanhthu: 1890 },
    { name: 'Tháng 10', doanhthu: 2390 },
    { name: 'Tháng 11', doanhthu: 3490 },
];