export interface MarketplaceProduct {
  id: string;
  name: string;
  priceEth: number;
  stock: number;
  thumbnail: string;
  category: string;
  sellerName: string;
  sellerAddress: string;
  rating: number;
  batchId: string;
  harvestDate: string;
  description: string;
  highlights: string[];
}

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: "p-saurieng-ri6",
    name: "Sầu riêng Ri6 loại 1 (thùng 10kg)",
    priceEth: 0.15,
    stock: 32,
    thumbnail: "/images/products/durian-ri6.jpg",
    category: "Trái cây",
    sellerName: "HTX Hữu Cơ Đồng Nai",
    sellerAddress: "0x8a13f2B0F064A5E1FE1fE15a1eC10B23c0FA1234",
    rating: 4.9,
    batchId: "BATCH-001",
    harvestDate: "2025-09-12",
    description:
      "Sầu riêng Ri6 được tuyển chọn từ vườn canh tác hữu cơ, thu hoạch và đóng gói trong ngày. Đã kiểm định dư lượng và đạt chứng nhận VietGAP.",
    highlights: [
      "Đóng gói lạnh 10kg/thùng",
      "Kèm chứng nhận VietGAP (PDF)",
      "Theo dõi vận chuyển ở 8°C",
      "CID: bafybeigdyrv2examplecid0001",
    ],
  },
  {
    id: "p-cam-sanh",
    name: "Cam sành Hàm Yên (thùng 20kg)",
    priceEth: 0.08,
    stock: 64,
    thumbnail: "/images/products/cam-sanh.jpg",
    category: "Trái cây",
    sellerName: "HTX Nông sản Hàm Yên",
    sellerAddress: "0x7Ab93E5d2C10a9B1551a41921cB05dAf08fE4567",
    rating: 4.7,
    batchId: "BATCH-002",
    harvestDate: "2025-09-05",
    description:
      "Cam sành tuyển chọn, độ ngọt 13° Brix, sơ chế tại nhà máy Hàm Yên, tem QR truy xuất nguồn gốc rõ ràng.",
    highlights: [
      "Chứng nhận OCOP 4 sao",
      "Vận chuyển giữ lạnh 5°C",
      "Tem QR truy xuất nguồn gốc",
      "CID: bafybeigdyrv2examplecid0002",
    ],
  },
  {
    id: "p-ca-phe",
    name: "Cà phê Arabica Cầu Đất (bao 15kg)",
    priceEth: 0.12,
    stock: 40,
    thumbnail: "/images/products/arabica-caudat.jpg",
    category: "Cà phê",
    sellerName: "HTX Cầu Đất Farm",
    sellerAddress: "0x1F52CeA70d29a6E37a71E0c63ec20c4c7E0F9876",
    rating: 4.8,
    batchId: "BATCH-003",
    harvestDate: "2025-08-21",
    description:
      "Hạt Arabica rang nhẹ, độ ẩm 11%, đóng gói hút chân không, phù hợp xuất khẩu.",
    highlights: [
      "Độ ẩm 11%, cỡ hạt 16-18",
      "Kèm COA và hợp đồng mẫu",
      "CID: bafybeigdyrv2examplecid0003",
    ],
  },
];

export interface BuyerOrderSummary {
  id: number;
  productId: string;
  productName: string;
  sellerName: string;
  totalEth: number;
  status: "Held" | "Released" | "Refunded" | "Disputed";
  createdAt: string;
  txHash?: string;
}

export const buyerOrdersMock: BuyerOrderSummary[] = [
  {
    id: 2048,
    productId: "p-saurieng-ri6",
    productName: "Sầu riêng Ri6 loại 1 (10kg)",
    sellerName: "HTX Hữu Cơ Đồng Nai",
    totalEth: 0.3,
    status: "Held",
    createdAt: "2025-10-12T08:45:00.000Z",
  },
  {
    id: 2047,
    productId: "p-cam-sanh",
    productName: "Cam sành Hàm Yên (20kg)",
    sellerName: "HTX Nông sản Hàm Yên",
    totalEth: 0.24,
    status: "Released",
    createdAt: "2025-10-08T14:12:00.000Z",
    txHash: "0x836c1f0d9b3ee810e19df0e7268e589c2fea2a7a43d8113567fd92f0d12345aa",
  },
  {
    id: 2046,
    productId: "p-ca-phe",
    productName: "Cà phê Arabica Cầu Đất (15kg)",
    sellerName: "HTX Cầu Đất Farm",
    totalEth: 0.12,
    status: "Refunded",
    createdAt: "2025-09-28T06:05:00.000Z",
    txHash: "0xa9bc86f41cf22670143d37c03bb908f589df872c645571d9120f7bcff98765ff",
  },
];

export const batchesTraceMock = [
  {
    batchId: "BATCH-001",
    productName: "Sầu riêng Ri6 loại 1",
    farmName: "HTX Hữu Cơ Đồng Nai",
    variety: "Ri6",
    harvestDate: "2025-09-12",
    certificates: [
      { name: "Chứng nhận VietGAP", url: "https://ipfs.io/ipfs/bafybeigdyrv2examplecid0001/vietgap.pdf" },
    ],
    ipfsCid: "bafybeigdyrv2examplecid0001",
    hashSha256: "0xfakehash0001",
    anchorTxHash: "0x1d32bc0a998c7f12f5f87b8293e1234567890abcdeffedcba0987654321ffff",
  },
  {
    batchId: "BATCH-002",
    productName: "Cam sành Hàm Yên",
    farmName: "HTX Nông sản Hàm Yên",
    variety: "Cam sành",
    harvestDate: "2025-09-05",
    certificates: [
      { name: "Kiểm nghiệm dư lượng", url: "https://ipfs.io/ipfs/bafybeigdyrv2examplecid0002/residue.pdf" },
    ],
    ipfsCid: "bafybeigdyrv2examplecid0002",
    hashSha256: "0xfakehash0002",
    anchorTxHash: "0x536febbda856bcd45f9521a09876abcef1234567890aabccddeeff1122334455",
  },
];

export function getProductById(id: string): MarketplaceProduct | undefined {
  return marketplaceProducts.find((product) => product.id === id);
}
