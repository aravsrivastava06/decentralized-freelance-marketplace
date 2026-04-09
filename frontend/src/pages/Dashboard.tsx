import { useWeb3 } from "@/contexts/Web3Context";
import { useJobs } from "@/contexts/JobsContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, Search, Coins, FileText } from "lucide-react";

export default function Dashboard() {
  const { address, isConnected, role, setRole } = useWeb3();
  const { jobs } = useJobs();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) navigate("/");
  }, [isConnected, navigate]);

  const myJobs = jobs.filter(
    (j) => role === "client" ? j.client === address : j.applicants.includes(address || "")
  );

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: FileText },
    { label: "Open Jobs", value: jobs.filter((j) => j.status === "open").length, icon: Search },
    { label: "My Jobs", value: myJobs.length, icon: Briefcase },
    { label: "Total Value", value: `${jobs.reduce((s, j) => s + parseFloat(j.budget), 0).toFixed(1)} ETH`, icon: Coins },
  ];

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-2">
          <Label htmlFor="role" className={`text-sm ${role === "client" ? "text-primary" : "text-muted-foreground"}`}>
            Client
          </Label>
          <Switch
            id="role"
            checked={role === "freelancer"}
            onCheckedChange={(v) => setRole(v ? "freelancer" : "client")}
          />
          <Label htmlFor="role" className={`text-sm ${role === "freelancer" ? "text-primary" : "text-muted-foreground"}`}>
            Freelancer
          </Label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-gradient-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button className="gap-2" onClick={() => navigate("/post-job")}>
          <Briefcase className="h-4 w-4" /> Post a Job
        </Button>
        <Button variant="secondary" className="gap-2" onClick={() => navigate("/jobs")}>
          <Search className="h-4 w-4" /> Browse Jobs
        </Button>
      </div>
    </div>
  );
}
