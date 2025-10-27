import { ethers } from "ethers";

// Contract ABI - chỉ cần các hàm cần thiết
export const AGRO_ESCROW_ABI = [
  "function anchorBatchHash(uint256 batchId, bytes32 hash) external",
  "function getBatch(uint256 batchId) external view returns (tuple(uint256 batchId, bytes32 hash, address creator, uint256 timestamp))",
  "function isBatchAnchored(uint256 batchId) external view returns (bool)",
  "event BatchHashAnchored(uint256 indexed batchId, bytes32 indexed hash, address indexed creator)"
];

// Contract address (sẽ được set từ environment)
export const AGRO_ESCROW_ADDRESS = import.meta.env.VITE_AGRO_ESCROW_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Hardhat local network config
export const HARDHAT_CONFIG = {
  chainId: 31337,
  name: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
  blockExplorer: null,
};

/**
 * Tạo hash từ dữ liệu batch
 */
export function createBatchHash(batchData: {
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
 * Kết nối với MetaMask và lấy provider
 */
export async function getProvider(): Promise<ethers.BrowserProvider> {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Kiểm tra network
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== HARDHAT_CONFIG.chainId) {
    throw new Error(`Please switch to Hardhat Local network (Chain ID: ${HARDHAT_CONFIG.chainId})`);
  }

  return provider;
}

/**
 * Lấy signer từ provider
 */
export async function getSigner(): Promise<ethers.JsonRpcSigner> {
  const provider = await getProvider();
  return provider.getSigner();
}

/**
 * Tạo contract instance
 */
export async function getAgroEscrowContract(): Promise<ethers.Contract> {
  const signer = await getSigner();
  return new ethers.Contract(AGRO_ESCROW_ADDRESS, AGRO_ESCROW_ABI, signer);
}

/**
 * Ghi hash lên blockchain
 */
export async function anchorBatchHash(
  batchId: number,
  batchData: {
    batchCode: string;
    farmName: string;
    harvestDate: string;
    variety: string;
    notes?: string;
    ipfsCid?: string;
  }
): Promise<ethers.TransactionResponse> {
  try {
    const contract = await getAgroEscrowContract();
    const hash = createBatchHash(batchData);
    
    console.log("Anchoring batch hash:", {
      batchId,
      hash,
      batchData
    });

    const tx = await contract.anchorBatchHash(batchId, hash);
    console.log("Transaction sent:", tx.hash);
    
    return tx;
  } catch (error) {
    console.error("Error anchoring batch hash:", error);
    throw error;
  }
}

/**
 * Kiểm tra xem batch đã được anchor chưa
 */
export async function isBatchAnchored(batchId: number): Promise<boolean> {
  try {
    const contract = await getAgroEscrowContract();
    return await contract.isBatchAnchored(batchId);
  } catch (error) {
    console.error("Error checking batch anchor status:", error);
    return false;
  }
}

/**
 * Lấy thông tin batch từ blockchain
 */
export async function getBatchFromBlockchain(batchId: number) {
  try {
    const contract = await getAgroEscrowContract();
    return await contract.getBatch(batchId);
  } catch (error) {
    console.error("Error getting batch from blockchain:", error);
    return null;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
