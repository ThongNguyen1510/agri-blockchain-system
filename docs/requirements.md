# Requirements – AgroChain

## 2. Quy trình nghiệp vụ & dữ liệu

### 2.1 Luồng nghiệp vụ tổng quát
- Quy trình chuẩn hóa theo luồng Batch → Product → Order → Release/Refund.
- Tạo batch mới khi Seller thu hoạch; batch chứa metadata, chứng chỉ đính kèm IPFS.
- Product được niêm yết từ batch với thông tin giá, tồn kho; nhiều product có thể tham chiếu cùng batch.
- Buyer tạo order, smart contract escrow khóa tiền; backend lưu order và hash giao dịch.
- Khi Buyer xác nhận nhận hàng, backend gọi smart contract giải phóng tiền cho Seller; nếu tranh chấp, Admin kích hoạt refund.
- Chi tiết sequence xem sơ đồ Mermaid tại `docs/flows/batch-order-flow.mmd`.

### 2.2 Bảng dữ liệu SQL Server
| Bảng | Mục đích | Trường chính | Ghi chú |
| --- | --- | --- | --- |
| `Users` | Quản lý tài khoản hệ thống | `id (uniqueidentifier)` | Lưu role (`Seller`/`Buyer`/`Admin`), mật khẩu băm, thông tin liên hệ chỉ trong DB |
| `Batches` | Thông tin lô nông sản | `id (uniqueidentifier)`, `ownerId`, `harvestDate`, `ipfsCid`, `chainHash` | `ownerId` FK → `Users.id`; `chainHash` là hash ghi nhận trên blockchain |
| `Products` | Sản phẩm niêm yết từ batch | `id`, `batchId`, `price`, `stock`, `status` | FK `batchId` → `Batches.id`; `status` (`Draft`, `Active`, `SoldOut`, `Archived`) |
| `Orders` | Đơn hàng escrow | `id`, `productId`, `buyerId`, `quantity`, `totalAmount`, `escrowTxHash`, `state` | `state` (`Pending`, `InEscrow`, `Released`, `Refunded`, `Disputed`) |
| `AuditLogs` | Theo dõi hành động quan trọng | `id`, `userId`, `action`, `entity`, `entityId`, `metadata`, `createdAt` | Lưu JSON metadata mô tả yêu cầu/trạng thái |
| `Disputes` *(tùy chọn)* | Theo dõi tranh chấp | `id`, `orderId`, `reason`, `resolution`, `resolvedBy` | Chỉ tạo nếu cần mô tả chi tiết tiến trình tranh chấp |

*Migration*: dùng ORM (NestJS + Prisma/TypeORM) kết nối SQL Server (`mssql` driver); thiết lập migration định kỳ cho schema.

### 2.3 Dữ liệu on-chain
- **Escrow Order**: mỗi order tạo `escrowId`, địa chỉ Seller/Buyer, số tiền ký quỹ, `state`, dấu thời gian. Trạng thái cập nhật qua smart contract hành động release/refund/dispute.
- **Batch Hash**: lưu hash (Keccak256) của metadata batch + chứng chỉ; đồng thời đẩy CID IPFS để truy xuất file off-chain.
- **Event Logs**: phát sự kiện `BatchRegistered`, `OrderEscrowed`, `OrderReleased`, `OrderRefunded`, `DisputeRaised` để backend đồng bộ vào `AuditLogs`.

### 2.4 Phân bổ dữ liệu
| Loại dữ liệu | Blockchain | SQL Server |
| --- | --- | --- |
| Thông tin định danh user | Không | Có |
| Metadata batch (hash, CID) | Có | Có (tham chiếu) |
| Chi tiết sản phẩm, giá | Không | Có |
| Số dư ký quỹ, trạng thái escrow | Có | Có (đồng bộ trạng thái) |
| Chứng chỉ định dạng file | Không (lưu IPFS) | Tham chiếu tới CID |
| Lịch sử hành động | Nhật ký sự kiện | Audit log chi tiết |

### 2.5 Kiến trúc công nghệ (tóm tắt)
- **Frontend**: Next.js + Tailwind + wagmi/RainbowKit để xây giao diện và kết nối ví blockchain.
- **Backend**: NestJS (hoặc Express) + Prisma + SQL Server đảm nhiệm API và quản lý dữ liệu trung tâm.
- **Smart Contract**: Solidity + Hardhat (local/testnet) điều phối escrow và lưu hash batch on-chain.
- **Storage**: IPFS (web3.storage) lưu ảnh, chứng chỉ; cơ sở dữ liệu chỉ lưu CID/URL.
- **CI/CD & chất lượng**: GitHub Actions + ESLint + Prettier + Husky giữ chuẩn code.

👉 Tóm lại: Web app ↔ Backend ↔ Smart Contract ↔ IPFS, với SQL Server làm DB lõi.

