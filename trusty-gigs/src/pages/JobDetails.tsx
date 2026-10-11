import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useJobs } from "@/contexts/JobsContext";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { EscrowPanel } from "@/components/EscrowPanel";
import { toast } from "sonner";
import { ArrowLeft, Coins, Clock, Edit3, User, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { getJob, applyToJob, assignFreelancer, updateJobStatus, updateJobDescription, repostJob } = useJobs();
  const { address, role } = useWeb3();
  const navigate = useNavigate();

  const job = getJob(id || "");
  const currentDescription = job?.description ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [draftDescription, setDraftDescription] = useState("");

  useEffect(() => {
    setDraftDescription(currentDescription);
  }, [currentDescription]);

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Job not found</p>
        <Button variant="secondary" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  const isClient = role === "client";
  const hasApplied = address ? job.applicants.includes(address) : false;
  const isOwner = !!address && job.client.toLowerCase() === address.toLowerCase();

  const handleApply = () => {
    if (!address) return;
    applyToJob(job.id, address);
    toast.success("Applied successfully!");
  };

  const handleAssign = (freelancerAddr: string) => {
    assignFreelancer(job.id, freelancerAddr);
    toast.success("Freelancer assigned!");
  };

  const handleSaveDescription = () => {
    if (!draftDescription.trim()) {
      toast.error("Description cannot be empty");
      return;
    }
    updateJobDescription(job.id, draftDescription.trim());
    setIsEditing(false);
    toast.success("Description updated off-chain");
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate("/jobs")}>
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold">{job.title}</h1>{isOwner && <Button variant="ghost" size="icon" onClick={() => { setDraftDescription(job.description); setIsEditing(true); }} aria-label="Edit job description"><Edit3 className="h-4 w-4" /></Button>}</div>
                <StatusBadge status={job.status} />
              </div>

              {isOwner && <div className="flex flex-wrap gap-2"><Button variant="secondary" className="gap-2" onClick={() => { setDraftDescription(job.description); setIsEditing(true); }}><Edit3 className="h-4 w-4" /> Edit Description</Button><Button variant="outline" onClick={() => { repostJob(job.id); toast.success("Job reposted as a new listing"); navigate("/jobs"); }}>Repost Listing</Button></div>}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Coins className="h-4 w-4 text-primary" />{job.budget} ETH</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{job.deadline}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{job.client.slice(0, 10)}...</span>
              </div>

              <div>
                <h2 className="font-display font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>

              {/* Apply button for freelancers */}
              {!isClient && job.status === "open" && (
                <Button onClick={handleApply} disabled={hasApplied} className="gap-2">
                  {hasApplied ? "Applied ✓" : "Apply for this Job"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Applicants - visible to client */}
          {isClient && job.applicants.length > 0 && (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Applicants ({job.applicants.length})
                </h2>
                <div className="space-y-2">
                  {job.applicants.map((a) => (
                    <div key={a} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                      <span className="font-mono text-sm">{a}</span>
                      {job.status === "open" && (
                        <Button size="sm" variant="secondary" onClick={() => handleAssign(a)}>
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

        {/* Sidebar */}
        <div className="space-y-4">
          {(job.status === "assigned" || job.status === "funded" || job.status === "completed") && (
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
                <h3 className="font-display text-sm font-semibold text-muted-foreground mb-2">Assigned Freelancer</h3>
                <p className="font-mono text-sm text-foreground">{job.freelancer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit job description</DialogTitle><DialogDescription>This update is stored off-chain. Any escrow or payment state stays untouched.</DialogDescription></DialogHeader>
          <div className="space-y-2"><Label htmlFor="job-description">Description</Label><Textarea id="job-description" rows={8} value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} /></div>
          <DialogFooter><Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleSaveDescription}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
