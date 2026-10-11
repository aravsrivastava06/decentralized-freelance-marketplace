import { JobStatus } from "@/contexts/JobsContext";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-info/15 text-info border-info/30" },
  assigned: { label: "Assigned", className: "bg-warning/15 text-warning border-warning/30" },
  funded: { label: "Funded", className: "bg-success/15 text-success border-success/30" },
  completed: { label: "Completed", className: "bg-primary/15 text-primary border-primary/30" },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
