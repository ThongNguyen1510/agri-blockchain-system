import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { toast } from "sonner";

interface WalletContextValue {
  walletAddress: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const STORAGE_KEY = "agrochain.wallet";
const HARDHAT_CHAIN_ID_HEX = "0x7a69";
const HARDHAT_CHAIN_DEC = parseInt(HARDHAT_CHAIN_ID_HEX, 16);
const HARDHAT_NETWORK_PARAMS = {
  chainId: HARDHAT_CHAIN_ID_HEX,
  chainName: "Hardhat Local",
  nativeCurrency: { name: "Hardhat ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["http://127.0.0.1:8545"],
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAccountsChanged = useCallback((accounts?: unknown) => {
    if (!Array.isArray(accounts) || accounts.length === 0) {
      setWalletAddress(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const account = String(accounts[0]);
    setWalletAddress(account);
    localStorage.setItem(STORAGE_KEY, account);
  }, []);

  const ensureHardhatNetwork = useCallback(async () => {
    if (!window.ethereum?.request) {
      return false;
    }
    try {
      const chainHex = await window.ethereum.request<string>({ method: "eth_chainId" });
      if (chainHex?.toLowerCase() === HARDHAT_CHAIN_ID_HEX) {
        return true;
      }
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
      return true;
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 4902 || code === -32603) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [HARDHAT_NETWORK_PARAMS],
          });
          return true;
        } catch (addError) {
          const message =
            addError instanceof Error && addError.message
              ? addError.message
              : "Không thể thêm mạng Hardhat.";
          toast.error(message);
          return false;
        }
      }
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Không thể chuyển sang mạng Hardhat.";
      toast.error(message);
      return false;
    }
  }, []);

  useEffect(() => {
    const cachedAddress = localStorage.getItem(STORAGE_KEY);
    if (!cachedAddress) {
      return;
    }
    // Attempt silent refresh if provider exists
    if (window.ethereum?.request) {
      window.ethereum
        .request<string[]>({ method: "eth_accounts" })
        .then(async (accounts) => {
          const onHardhat = await ensureHardhatNetwork();
          if (!onHardhat) {
            handleAccountsChanged([]);
            return;
          }
          handleAccountsChanged(accounts);
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
        });
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [handleAccountsChanged, ensureHardhatNetwork]);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider?.on) {
      return;
    }

    const accountsChanged = (accounts: unknown) => handleAccountsChanged(accounts);
    const chainChanged = () => {
      if (provider?.request) {
        provider
          .request<string[]>({ method: "eth_accounts" })
          .then(async (accounts) => {
            const ok = await ensureHardhatNetwork();
            if (!ok) {
              handleAccountsChanged([]);
              return;
            }
            handleAccountsChanged(accounts);
          })
          .catch(() => handleAccountsChanged([]));
      }
    };

    provider.on("accountsChanged", accountsChanged);
    provider.on("chainChanged", chainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
    };
  }, [handleAccountsChanged, ensureHardhatNetwork]);

  const connect = useCallback(async () => {
    if (!window.ethereum?.request) {
      toast.error("Không phát hiện ví MetaMask. Vui lòng cài đặt và thử lại.");
      return;
    }
    setIsConnecting(true);
    try {
      const networkOk = await ensureHardhatNetwork();
      if (!networkOk) {
        setIsConnecting(false);
        return;
      }
      const accounts = await window.ethereum.request<string[]>({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        handleAccountsChanged(accounts);
        toast.success(`Đã kết nối ví ${account.slice(0, 6)}...${account.slice(-4)}`);
      } else {
        handleAccountsChanged([]);
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Không thể kết nối ví. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged]);

  const disconnect = useCallback(() => {
    setWalletAddress(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("Đã ngắt kết nối ví.");
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      walletAddress,
      isConnecting,
      connect,
      disconnect,
    }),
    [walletAddress, isConnecting, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
