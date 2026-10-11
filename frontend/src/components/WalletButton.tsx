import { useWeb3 } from "@/contexts/Web3Context";
import { Wallet, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const { address, isConnecting, isConnected, connectWallet, disconnectWallet } = useWeb3();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-mono">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={disconnectWallet} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} disabled={isConnecting} className="gap-2 glow">
      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      Connect Wallet
    </Button>
  );
}
