import { getContract } from "@/services/contract";
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useJobs } from "@/contexts/JobsContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function PostJob() {
  const { address, isConnected } = useWeb3();
  const { addJob } = useJobs();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    freelancer: "", // ✅ NEW FIELD
  });

  const [loading, setLoading] = useState(false);

  // 🔥 BLOCKCHAIN FUNCTION
  const handleCreateJobOnChain = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      if (!form.freelancer) {
        toast.error("Enter freelancer address");
        return;
      }

      setLoading(true);

      const tx = await contract.createJob(form.freelancer);
      await tx.wait();

      toast.success("✅ Job created on blockchain!");
    } catch (error) {
      console.error(error);
      toast.error("❌ Blockchain transaction failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATED SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.budget || !form.deadline) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // 👉 Step 1: Create on blockchain
      await handleCreateJobOnChain();

      // 👉 Step 2: Store locally (UI state)
      addJob({
        ...form,
        client: address || "0x0000",
      });

      toast.success("Job posted successfully!");
      navigate("/jobs");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isConnected) {
    navigate("/");
    return null;
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Post a Job</h1>

      <Card className="bg-gradient-card border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Build a DeFi Dashboard"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Describe the job requirements in detail..."
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Freelancer Address */}
            <div className="space-y-2">
              <Label htmlFor="freelancer">Freelancer Address</Label>
              <Input
                id="freelancer"
                placeholder="0x..."
                value={form.freelancer}
                onChange={(e) =>
                  setForm({ ...form, freelancer: e.target.value })
                }
              />
            </div>

            {/* Budget + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (ETH)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="1.5"
                  value={form.budget}
                  onChange={(e) =>
                    setForm({ ...form, budget: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Processing..." : "Post Job"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}