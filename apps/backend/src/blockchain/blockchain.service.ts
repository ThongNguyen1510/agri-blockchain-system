import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ethers } from "ethers";

// ABI tối thiểu cho AgroEscrow
const AGRO_ESCROW_ABI = [
  "function getOrder(uint256 orderId) external view returns (tuple(address buyer, address seller, bytes32 productId, uint256 amount, uint8 status))",
  "function nextOrderId() external view returns (uint256)",
  "function getBatch(uint256 batchId) external view returns (tuple(uint256 batchId, bytes32 hash, address creator, uint256 timestamp))",
  "function isBatchAnchored(uint256 batchId) external view returns (bool)",
  // write function to anchor a batch hash on-chain
  "function anchorBatchHash(uint256 batchId, bytes32 hash) external",
  // write function to record a batch transfer event
  "function recordBatchTransfer(uint256 batchId, string fromRole, string toRole, string fromName, string toName) external",
  "event OrderCreated(uint256 indexed orderId, address indexed buyer, address indexed seller, bytes32 productId, uint256 amount)",
  "event OrderReleased(uint256 indexed orderId)",
  "event OrderRefunded(uint256 indexed orderId)",
  "event BatchHashAnchored(uint256 indexed batchId, bytes32 indexed hash, address indexed creator)"
];

export enum OrderStatus {
  Held = 0,
  Released = 1,
  Refunded = 2,
}

export interface OnChainOrder {
  buyer: string;
  seller: string;
  productId: string;
  amount: bigint;
  status: OrderStatus;
}

export interface OnChainBatch {
  batchId: bigint;
  hash: string;
  creator: string;
  timestamp: bigint;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private readonly contractAddress: string;
  private readonly rpcUrl: string;
  private readonly privateKey: string | null;

  constructor(private readonly configService: ConfigService) {
    this.rpcUrl = this.configService.get<string>("BLOCKCHAIN_RPC_URL") || "http://127.0.0.1:8545";
    const fromAgro = this.configService.get<string>("AGRO_ESCROW_ADDRESS");
    const fromGeneric = this.configService.get<string>("CONTRACT_ADDRESS");
    this.contractAddress = (fromAgro && fromAgro.trim()) || (fromGeneric && fromGeneric.trim()) || "";
    this.privateKey = (this.configService.get<string>("PRIVATE_KEY") || "").trim() || null;

    this.logger.debug(`Resolved contract address: ${this.contractAddress}`);
    this.logger.debug(`Resolved rpc url: ${this.rpcUrl}`);

    if (!this.contractAddress) {
      this.logger.warn("AGRO_ESCROW_ADDRESS not configured. Blockchain features disabled.");
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      this.contract = new ethers.Contract(this.contractAddress, AGRO_ESCROW_ABI, this.provider);
      this.logger.log(`Blockchain service initialized: ${this.contractAddress} @ ${this.rpcUrl}`);
    } catch (error) {
      this.logger.error("Failed to initialize blockchain service:", error);
    }
  }

  /**
   * Kiểm tra xem blockchain service có sẵn sàng không
   */
  isAvailable(): boolean {
    return this.contract !== null && this.provider !== null;
  }

  /**
   * Lấy thông tin order từ blockchain
   */
  async getOrder(orderId: number): Promise<OnChainOrder | null> {
    if (!this.isAvailable()) {
      this.logger.warn("Blockchain not available");
      return null;
    }

    try {
      const result = await this.contract!.getOrder(orderId);
      return {
        buyer: result.buyer,
        seller: result.seller,
        productId: result.productId,
        amount: result.amount,
        status: result.status as OrderStatus,
      };
    } catch (error) {
      this.logger.error(`Failed to get order ${orderId} from blockchain:`, error);
      return null;
    }
  }

  /**
   * Lấy order ID tiếp theo
   */
  async getNextOrderId(): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const nextId = await this.contract!.nextOrderId();
      return Number(nextId);
    } catch (error) {
      this.logger.error("Failed to get next order ID:", error);
      return null;
    }
  }

  /**
   * Kiểm tra xem batch đã được anchor chưa
   */
  async isBatchAnchored(batchId: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return await this.contract!.isBatchAnchored(batchId);
    } catch (error) {
      this.logger.error(`Failed to check batch ${batchId} anchor status:`, error);
      return false;
    }
  }

  /**
   * Lấy thông tin batch từ blockchain
   */
  async getBatch(batchId: number): Promise<OnChainBatch | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const result = await this.contract!.getBatch(batchId);
      return {
        batchId: result.batchId,
        hash: result.hash,
        creator: result.creator,
        timestamp: result.timestamp,
      };
    } catch (error) {
      this.logger.error(`Failed to get batch ${batchId} from blockchain:`, error);
      return null;
    }
  }

  /**
   * Tạo hash từ batch data (để verify)
   */
  createBatchHash(batchData: {
    batchCode: string;
    farmName: string;
    harvestDate: string;
    variety: string;
    notes?: string;
    ipfsCid?: string;
  }): string {
    const dataString = JSON.stringify(batchData, Object.keys(batchData).sort());
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  /**
   * Anchor batch hash on-chain and return transaction hash
   */
  async anchorBatchHashTx(batchId: number, batchData: {
    batchCode: string;
    farmName: string;
    harvestDate: string;
    variety: string;
    notes?: string;
    ipfsCid?: string;
  }): Promise<{ txHash: string }> {
    if (!this.isAvailable()) {
      throw new Error("Blockchain not available");
    }
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY not configured for write transactions");
    }
    try {
      const signer = new ethers.Wallet(this.privateKey, this.provider!);
      const writable = this.contract!.connect(signer);
      const hashBytes32 = this.createBatchHash(batchData);
      const tx = await (writable as any)["anchorBatchHash"](batchId, hashBytes32);
      const receipt = await tx.wait(1);
      this.logger.log(`Anchored batch ${batchId} on-chain. Tx: ${tx.hash}`);
      return { txHash: tx.hash };
    } catch (error) {
      this.logger.error(`Failed to anchor batch ${batchId}:`, error);
      throw error;
    }
  }

  /**
   * Verify batch hash on-chain
   */
  async verifyBatchHash(
    batchId: number,
    batchData: {
      batchCode: string;
      farmName: string;
      harvestDate: string;
      variety: string;
      notes?: string;
      ipfsCid?: string;
    }
  ): Promise<{ anchored: boolean; verified: boolean; onChainHash?: string }> {
    const anchored = await this.isBatchAnchored(batchId);
    
    if (!anchored) {
      return { anchored: false, verified: false };
    }

    const onChainBatch = await this.getBatch(batchId);
    if (!onChainBatch) {
      return { anchored: true, verified: false };
    }

    const computedHash = this.createBatchHash(batchData);
    const verified = onChainBatch.hash === computedHash;

    return {
      anchored: true,
      verified,
      onChainHash: onChainBatch.hash,
    };
  }

  /**
   * Record a batch transfer event on-chain and return transaction hash
   */
  async recordBatchTransferTx(
    batchId: number,
    params: { fromRole: string; toRole: string; fromName: string; toName: string },
  ): Promise<{ txHash: string }> {
    if (!this.isAvailable()) {
      throw new Error("Blockchain not available");
    }
    if (!this.privateKey) {
      throw new Error("PRIVATE_KEY not configured for write transactions");
    }
    try {
      const signer = new ethers.Wallet(this.privateKey, this.provider!);
      const writable = this.contract!.connect(signer);
      const tx = await (writable as any)["recordBatchTransfer"](
        batchId,
        params.fromRole,
        params.toRole,
        params.fromName,
        params.toName,
      );
      const receipt = await tx.wait(1);
      this.logger.log(`Recorded batch transfer ${batchId} on-chain. Tx: ${tx.hash}`);
      return { txHash: tx.hash };
    } catch (error) {
      this.logger.error(`Failed to record batch transfer ${batchId}:`, error);
      throw error;
    }
  }
}
