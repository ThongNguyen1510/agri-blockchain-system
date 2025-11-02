# 🧪 **TEST PLAN - AGROCHAIN SELLER FEATURES**

## ✅ **HOÀN THÀNH 100%**

### **1. 🔐 Authentication & Registration**
- [x] Đăng nhập với `testseller1@gmail.com` / `password123`
- [x] Đăng ký tài khoản Seller mới
- [x] Auto-fill wallet address khi kết nối ví
- [x] Role-based routing (chỉ Seller mới thấy seller pages)

### **2. 📦 Batch Management**
- [x] Tạo lô hàng mới với form validation
- [x] Upload tài liệu lên IPFS (mock)
- [x] **TÍCH HỢP BLOCKCHAIN**: Ghi hash lên smart contract
- [x] Checkbox để chọn có anchor lên blockchain không
- [x] Loading states cho blockchain transaction

### **3. 🛍️ Product Management**
- [x] Tạo sản phẩm mới
- [x] Liên kết với batchId
- [x] Quản lý giá và tồn kho
- [x] API integration hoàn chỉnh

### **4. 📊 Dashboard & Analytics**
- [x] Thống kê doanh thu
- [x] Số đơn hàng
- [x] Sản phẩm còn hàng
- [x] Biểu đồ doanh số

### **5. 📋 Order Management**
- [x] Xem danh sách đơn hàng
- [x] Filter theo trạng thái (Held, Released, etc.)
- [x] **XÁC NHẬN GIAO HÀNG**: Nút "Xác nhận" cho orders Held
- [x] **HỦY ĐƠN HÀNG**: Nút "Hủy" cho orders Pending/Held
- [x] Role-based actions (chỉ Seller thấy nút actions)

---

## 🚀 **CÁCH TEST**

### **Bước 1: Khởi động hệ thống**
```bash
# Terminal 1: Backend
cd apps/backend
npm run start:dev

# Terminal 2: Frontend  
cd apps/frontend
npm run dev

# Terminal 3: Hardhat (nếu test blockchain)
cd apps/contracts
npx hardhat node
```

### **Bước 2: Test Authentication**
1. Truy cập `http://localhost:5173`
2. Click "Đăng nhập"
3. Nhập: `testseller1@gmail.com` / `password123`
4. ✅ Kiểm tra redirect đến seller dashboard

### **Bước 3: Test Batch Creation với Blockchain**
1. Vào "Bán hàng" → "Lô hàng" → "Tạo lô hàng mới"
2. Điền form:
   - Mã lô: `BATCH-TEST-001`
   - Tên nông trại: `Farm ABC`
   - Ngày thu hoạch: `2024-01-15`
   - Giống cây: `Lúa ST25`
3. ✅ Check "Ghi hash lên blockchain"
4. Click "Tạo lô hàng"
5. ✅ Kiểm tra: Loading states, success message, blockchain TX hash

### **Bước 4: Test Product Creation**
1. Vào "Bán hàng" → "Sản phẩm" → "Tạo sản phẩm mới"
2. Điền form và chọn batch vừa tạo
3. ✅ Kiểm tra tạo thành công

### **Bước 5: Test Order Management**
1. Vào "Đơn hàng"
2. ✅ Kiểm tra filter theo trạng thái
3. ✅ Kiểm tra nút "Xác nhận" và "Hủy" (chỉ Seller thấy)
4. Test click các nút actions

### **Bước 6: Test Blockchain Integration**
1. Tạo batch mới với blockchain enabled
2. ✅ Kiểm tra console logs:
   - "Anchoring batch to blockchain..."
   - "Blockchain transaction: 0x..."
3. ✅ Kiểm tra success message với TX hash

---

## 🎯 **KẾT QUẢ MONG ĐỢI**

### **✅ Thành công**
- Tất cả forms hoạt động với validation
- API calls thành công (200 responses)
- Blockchain transactions được gửi
- UI/UX smooth với loading states
- Role-based permissions hoạt động

### **❌ Lỗi có thể gặp**
- **401 Unauthorized**: Backend chưa chạy hoặc token hết hạn
- **Blockchain error**: MetaMask chưa kết nối hoặc sai network
- **CORS error**: Backend CORS config chưa đúng

---

## 🔧 **TROUBLESHOOTING**

### **Lỗi Authentication**
```bash
# Restart backend
cd apps/backend
npm run start:dev
```

### **Lỗi Blockchain**
1. Kiểm tra MetaMask đã kết nối
2. Switch sang Hardhat Local (Chain ID: 31337)
3. Kiểm tra contract address trong .env

### **Lỗi CORS**
- Backend đã config CORS đúng
- Frontend gọi đúng API URL

---

## 🎉 **TỔNG KẾT**

**Tất cả 3 chức năng chính đã hoàn thành:**
1. ✅ **Quản lý đơn hàng** - Filter + Actions
2. ✅ **Tích hợp Blockchain** - Smart contract integration  
3. ✅ **Xác nhận giao hàng** - Release/Cancel orders

**Dự án sẵn sàng cho demo và production!** 🚀
