import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

interface Web3ContextType {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  provider: null,
  signer: null,
  connectWallet: async () => {},
  isConnected: false,
});

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // 🔗 Connect wallet manually
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accounts = await prov.send("eth_requestAccounts", []);

      const signer = await prov.getSigner();
      const addr = accounts[0];

      setProvider(prov);
      setSigner(signer);
      setAddress(addr);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  // 🔁 Auto connect on load (if already connected)
  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;

      try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        const accounts = await prov.listAccounts();

        if (accounts.length > 0) {
          const signer = await prov.getSigner();
          const addr = await signer.getAddress();

          setProvider(prov);
          setSigner(signer);
          setAddress(addr);
        }
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  // 🔥 IMPORTANT FIX: handle account switching
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Account changed:", accounts);

      // simplest + safest for your demo
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // 🔁 Optional: handle network change
  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address,
        provider,
        signer,
        connectWallet,
        isConnected: !!address,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

// 🧠 Hook
export const useWeb3 = () => useContext(Web3Context);