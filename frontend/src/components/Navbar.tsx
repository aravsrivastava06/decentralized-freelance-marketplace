import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "@/components/WalletButton";
import { useWeb3 } from "@/contexts/Web3Context";
import { Hexagon } from "lucide-react";

export function Navbar() {
  const { isConnected } = useWeb3();
  const location = useLocation();

  const navLinks = isConnected
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/jobs", label: "Browse Jobs" },
        { to: "/post-job", label: "Post Job" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Hexagon className="h-6 w-6 text-primary" />
          <span className="text-gradient">ChainWork</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
