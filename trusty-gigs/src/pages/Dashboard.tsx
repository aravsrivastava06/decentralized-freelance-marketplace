import { useWeb3 } from "@/contexts/Web3Context";
import { useJobs } from "@/contexts/JobsContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Briefcase, Search, Coins, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useBidEvents } from "@/hooks/use-bid-events";

export default function Dashboard() {
  const { address, isConnected, role, setRole } = useWeb3();
  const { jobs } = useJobs();
  const { events: bidEvents, loading: bidsLoading } = useBidEvents(address);
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
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
        </TabsContent>

        <TabsContent value="my-bids" className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">My Bids</h2>
            <p className="mt-1 text-sm text-muted-foreground">BidPlaced activity for this wallet on the connected contract.</p>
          </div>
          {bidsLoading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading bid events...</div>
          ) : bidEvents.length === 0 ? (
            <Card className="bg-gradient-card border-border/50"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><Radio className="h-8 w-8 text-muted-foreground" /><p className="text-muted-foreground">No on-chain bids found for this wallet yet.</p><Button variant="secondary" onClick={() => navigate("/jobs")}>Browse Jobs</Button></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {bidEvents.map((bid, index) => {
                const job = jobs.find((item) => item.id === bid.jobId);
                return <Link key={`${bid.jobId}-${bid.transactionHash || index}`} to={job ? `/jobs/${job.id}` : "/jobs"} className="block"><Card className="bg-gradient-card border-border/50 transition-colors hover:border-primary/30"><CardContent className="flex items-center justify-between gap-4 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Radio className="h-4 w-4 text-primary" /></div><div className="min-w-0"><p className="truncate font-medium">{job?.title || `On-chain Job #${bid.jobId}`}</p><p className="font-mono text-xs text-muted-foreground">{bid.transactionHash ? `${bid.transactionHash.slice(0, 10)}...` : "On-chain event"}</p></div></div><Badge variant="secondary">{bid.amount || "—"} ETH</Badge></CardContent></Card></Link>;
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
