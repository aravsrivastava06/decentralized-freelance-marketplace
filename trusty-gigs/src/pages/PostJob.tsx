import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useJobs } from "@/contexts/JobsContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      toast.error("Please fill all fields");
      return;
    }
    addJob({ ...form, client: address || "0x0000" });
    toast.success("Job posted successfully!");
    navigate("/jobs");
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
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Build a DeFi Dashboard"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                placeholder="Describe the job requirements in detail..."
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (ETH)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  placeholder="1.5"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2">
              <Send className="h-4 w-4" /> Post Job
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
