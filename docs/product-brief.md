# Product Brief – AgroChain

## 🎯 Mục tiêu hệ thống
Xây dựng một nền tảng **quản lý và mua bán nông sản** dựa trên công nghệ **web + blockchain** nhằm:
- Giúp người nông dân (Seller) dễ dàng niêm yết, bán và quản lý sản phẩm.
- Đảm bảo giao dịch minh bạch, an toàn cho người mua (Buyer) thông qua **hợp đồng thông minh escrow**.
- Cung cấp khả năng **truy xuất nguồn gốc** nông sản (batch + chứng chỉ) để tăng niềm tin.
- Đảm bảo quyền quản trị, giải quyết tranh chấp và bảo mật.

---

## ⚙️ Chức năng chính
1. **Quản lý nông sản**
   - Tạo lô hàng (batch), thêm thông tin (giống, ngày thu hoạch, nông trại…).
   - Niêm yết sản phẩm từ lô hàng, gắn ảnh/chứng chỉ.
   - Quản lý tồn kho, trạng thái sản phẩm.

2. **Giao dịch (Escrow)**
   - Buyer tạo đơn hàng, tiền được ký quỹ trong smart contract.
   - Buyer xác nhận nhận hàng → tiền giải phóng cho Seller.
   - Tranh chấp → Admin có quyền refund/giải quyết.

3. **Truy xuất nguồn gốc**
   - Lưu hash/CID metadata lô hàng, chứng chỉ lên blockchain.
   - Sinh QR code → Buyer quét để xem thông tin lô hàng và bằng chứng on-chain.

4. **Phân quyền**
   - **Seller**: tạo lô, niêm yết, bán hàng.
   - **Buyer**: đặt hàng, xác nhận, khiếu nại.
   - **Admin**: quản lý hệ thống, xử lý tranh chấp.

---

## 🛡️ Yêu cầu phi chức năng
- **Bảo mật**:  
  - Smart contract chống reentrancy, kiểm soát quyền.  
  - Backend kiểm tra input, validation.  
  - Không lưu PII (địa chỉ, số điện thoại) lên blockchain.

- **Hiệu năng**:  
  - Hệ thống demo chạy mượt local.  
  - Truy vấn DB nhanh, UI phản hồi <1s.

- **Chi phí & Demo**:  
  - Ưu tiên chạy **local (Hardhat)** hoặc testnet faucet free (Sepolia/Polygon Amoy).  
  - Không yêu cầu phí thật.

- **Dễ bảo trì & mở rộng**:  
  - Code theo module (FE, BE, SC).  
  - Có lint, test, CI/CD.  
  - Document rõ ràng.

---

## 📦 Deliverable của product
- **Web app**: giao diện quản lý & mua bán.  
- **Smart contract**: escrow + lưu hash batch.  
- **Database**: lưu thông tin user, product, order.  
- **Tài liệu**: hướng dẫn cài đặt, kiến trúc, use case, quy trình nghiệp vụ.  
