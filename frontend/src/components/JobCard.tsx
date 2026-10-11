import { Job } from "@/contexts/JobsContext";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Coins, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:glow group cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {job.title}
          </h3>
          <StatusBadge status={job.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-primary" />
            {job.budget} ETH
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {job.deadline}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {job.applicants.length}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
