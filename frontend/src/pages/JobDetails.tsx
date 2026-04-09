import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { getContract } from "@/services/contract";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { EscrowPanel } from "@/components/EscrowPanel";
import { toast } from "sonner";
import { ArrowLeft, Coins, Clock, User, Users } from "lucide-react";
import { useState } from "react";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { getJob, applyToJob, assignFreelancer, updateJobStatus } = useJobs();
  const { address, role } = useWeb3();
  const navigate = useNavigate();

  const job = getJob(id || "");
  const [loading, setLoading] = useState(false);

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Job not found</p>
        <Button variant="secondary" onClick={() => navigate("/jobs")}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const isClient = role === "client";
  const hasApplied = address ? job.applicants.includes(address) : false;

  const handleApply = () => {
    if (!address) return;
    applyToJob(job.id, address);
    toast.success("Applied successfully!");
  };

  const handleAssign = (freelancerAddr: string) => {
    assignFreelancer(job.id, freelancerAddr);
    toast.success("Freelancer assigned!");
  };

  //  NEW: FUND JOB (ESCROW)
  const handleFundJob = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      setLoading(true);

      const tx = await contract.fundJob(job.id, {
        value: ethers.parseEther(job.budget),
      });

      await tx.wait();

      updateJobStatus(job.id, "funded"); // update UI
      toast.success(" Job funded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(" Funding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Button
        variant="ghost"
        className="gap-2 text-muted-foreground"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-2xl font-bold">{job.title}</h1>
                <StatusBadge status={job.status} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-primary" />
                  {job.budget} ETH
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {job.deadline}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {job.client.slice(0, 10)}...
                </span>
              </div>

              <div>
                <h2 className="font-display font-semibold mb-2">
                  Description
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* APPLY */}
              {!isClient && job.status === "open" && (
                <Button onClick={handleApply} disabled={hasApplied}>
                  {hasApplied ? "Applied ✓" : "Apply for this Job"}
                </Button>
              )}

              {/*  FUND BUTTON */}
              {isClient && job.status === "assigned" && (
                <Button onClick={handleFundJob} disabled={loading}>
                  {loading ? "Processing..." : "Fund Job 💰"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* APPLICANTS */}
          {isClient && job.applicants.length > 0 && (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Applicants ({job.applicants.length})
                </h2>
                <div className="space-y-2">
                  {job.applicants.map((a) => (
                    <div
                      key={a}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
                    >
                      <span className="font-mono text-sm">{a}</span>
                      {job.status === "open" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAssign(a)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {(job.status === "assigned" ||
            job.status === "funded" ||
            job.status === "completed") && (
            <EscrowPanel
              jobId={job.id}
              budget={job.budget}
              status={job.status}
              isClient={isClient}
              onStatusChange={(s) => updateJobStatus(job.id, s)}
            />
          )}

          {job.freelancer && (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2">
                  Assigned Freelancer
                </h3>
                <p className="font-mono text-sm text-foreground">
                  {job.freelancer}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
