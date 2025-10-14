import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";
const localRpcUrl =
  process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";

export const wagmiConfig = getDefaultConfig({
  appName: "AgroChain Marketplace",
  projectId,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(localRpcUrl),
    [sepolia.id]: http(),
  },
  ssr: true,
});
