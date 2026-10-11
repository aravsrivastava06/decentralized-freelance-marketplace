import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft, Award, Coins, FileCheck2, Target, WalletCards } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";
import { useBidEvents } from "@/hooks/use-bid-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { address = "" } = useParams<{ address: string }>();
  const { jobs } = useJobs();
  const { events, loading } = useBidEvents(address);
  const normalizedAddress = address.toLowerCase();

  const profileJobs = useMemo(
    () => jobs.filter((job) => job.freelancer?.toLowerCase() === normalizedAddress),
    [jobs, normalizedAddress],
  );
  const completedJobs = profileJobs.filter((job) => job.status === "completed");
  const localBids = jobs.filter((job) => job.applicants.some((bidder) => bidder.toLowerCase() === normalizedAddress));
  const totalBids = events.length || localBids.length;
  const successfulBids = profileJobs.filter((job) => localBids.some((bid) => bid.id === job.id) || events.some((event) => event.jobId === job.id)).length;
  const successRate = totalBids ? Math.min(100, Math.round((successfulBids / totalBids) * 100)) : 0;
  const totalEarned = completedJobs.reduce((total, job) => total + Number.parseFloat(job.budget || "0"), 0);

  return (
    <div className="container max-w-5xl space-y-8 py-8">
      <Button asChild variant="ghost" className="gap-2 text-muted-foreground"><Link to="/jobs"><ArrowLeft className="h-4 w-4" /> Back to Jobs</Link></Button>
      <div className="space-y-3"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><WalletCards className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Freelancer profile</p><h1 className="break-all font-mono text-xl font-semibold">{address}</h1></div></div><p className="max-w-2xl text-muted-foreground">A wallet-based reputation view built from completed work and bid activity.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Completed jobs", value: completedJobs.length, icon: FileCheck2 },
          { label: "ETH earned", value: `${totalEarned.toFixed(2)} ETH`, icon: Coins },
          { label: "Bid success", value: `${successRate}%`, icon: Target },
          { label: "Total bids", value: loading ? "…" : totalBids, icon: Award },
        ].map((stat) => <Card key={stat.label} className="bg-gradient-card border-border/50"><CardContent className="flex items-center gap-3 pt-6"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><stat.icon className="h-4 w-4 text-primary" /></div><div><p className="font-display text-xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div></CardContent></Card>)}
      </div>

      <section className="space-y-4"><div><h2 className="font-display text-xl font-semibold">Completed work</h2><p className="mt-1 text-sm text-muted-foreground">Jobs completed by this wallet from the available marketplace data.</p></div>{completedJobs.length === 0 ? <Card className="bg-gradient-card border-border/50"><CardContent className="py-10 text-center text-sm text-muted-foreground">No completed jobs found for this wallet yet.</CardContent></Card> : <div className="grid gap-4 md:grid-cols-2">{completedJobs.map((job) => <Link key={job.id} to={`/jobs/${job.id}`}><Card className="bg-gradient-card border-border/50 transition-colors hover:border-primary/30"><CardContent className="space-y-3 pt-6"><div className="flex items-start justify-between gap-3"><h3 className="font-display font-semibold">{job.title}</h3><Badge className="bg-success text-success-foreground">Completed</Badge></div><p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p><p className="font-mono text-sm text-primary">{job.budget} ETH</p></CardContent></Card></Link>)}</div>}</section>
    </div>
  );
}