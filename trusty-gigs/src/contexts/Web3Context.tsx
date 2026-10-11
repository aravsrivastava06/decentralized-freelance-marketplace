import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { connectWallet as connectWalletService, getWalletAddress } from "@/services/blockchain";
import { toast } from "sonner";

type UserRole = "client" | "freelancer";

interface Web3State {
  address: string | null;
  isConnecting: boolean;
  role: UserRole;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: UserRole) => void;
  isConnected: boolean;
}

const Web3Context = createContext<Web3State | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [role, setRole] = useState<UserRole>("client");

  useEffect(() => {
    getWalletAddress().then((addr) => {
      if (addr) setAddress(addr);
    });

    const eth = (window as any).ethereum;
    if (eth) {
      const handleChange = (accounts: string[]) => {
        setAddress(accounts[0] || null);
      };
      eth.on("accountsChanged", handleChange);
      return () => eth.removeListener("accountsChanged", handleChange);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addr = await connectWalletService();
      setAddress(addr);
      toast.success("Wallet connected!");
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    toast.info("Wallet disconnected");
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnecting,
        role,
        connectWallet,
        disconnectWallet,
        setRole,
        isConnected: !!address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
