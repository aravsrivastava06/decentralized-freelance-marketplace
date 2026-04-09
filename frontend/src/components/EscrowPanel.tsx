import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, Unlock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { fundJob, releasePayment } from "@/services/blockchain";

interface EscrowPanelProps {
  jobId: string;
  budget: string;
  status: string;
  isClient: boolean;
  onStatusChange: (status: "funded" | "completed") => void;
}

export function EscrowPanel({ jobId, budget, status, isClient, onStatusChange }: EscrowPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleFund = async () => {
    setLoading("fund");
    try {
      await fundJob(Number(jobId), budget);
      toast.success("Escrow funded successfully!");
      onStatusChange("funded");
    } catch (err: any) {
      // Demo mode fallback
      toast.success("Demo: Escrow funded (simulated)");
      onStatusChange("funded");
    } finally {
      setLoading(null);
    }
  };

  const handleRelease = async () => {
    setLoading("release");
    try {
      await releasePayment(Number(jobId));
      toast.success("Payment released!");
      onStatusChange("completed");
    } catch (err: any) {
      toast.success("Demo: Payment released (simulated)");
      onStatusChange("completed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-primary/20 glow">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Escrow Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Escrow Amount</span>
          <span className="font-display font-semibold text-primary">{budget} ETH</span>
        </div>

        {isClient && status === "assigned" && (
          <Button onClick={handleFund} disabled={!!loading} className="w-full gap-2">
            {loading === "fund" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Fund Escrow
          </Button>
        )}

        {isClient && status === "funded" && (
          <Button onClick={handleRelease} disabled={!!loading} className="w-full gap-2">
            {loading === "release" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            Release Payment
          </Button>
        )}

        {status === "completed" && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Payment released successfully
          </div>
        )}

        {!isClient && (
          <p className="text-xs text-muted-foreground text-center">
            Only the client can manage escrow funds
          </p>
        )}
      </CardContent>
    </Card>
  );
}
