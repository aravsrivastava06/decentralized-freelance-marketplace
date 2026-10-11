import { Link, useLocation } from "react-router-dom";
import { WalletButton } from "@/components/WalletButton";
import { useWeb3 } from "@/contexts/Web3Context";
import { useJobs } from "@/contexts/JobsContext";
import { Bell, CheckCircle2, Hexagon, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isConnected } = useWeb3();
  const { notifications, unreadNotifications, markNotificationsRead } = useJobs();
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

        <div className="flex items-center gap-2">
          {isConnected && (
            <DropdownMenu onOpenChange={(open) => open && markNotificationsRead()}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Open activity notifications">
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Activity</DropdownMenuLabel>
                {notifications.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">No recent activity</div>
                ) : (
                  notifications.slice(0, 6).map((notification) => (
                    <Link key={notification.id} to={`/jobs/${notification.jobId}`} className="flex gap-3 rounded-sm px-2 py-3 hover:bg-secondary">
                      {notification.type === "accepted" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <Radio className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                      <span className="text-sm leading-snug">{notification.message}</span>
                    </Link>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
