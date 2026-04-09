import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type JobStatus = "open" | "assigned" | "funded" | "completed";

export interface Job {
  id: string;
  title: string;
  description: string;
  budget: string; // ETH
  deadline: string;
  client: string; // wallet address
  freelancer: string | null;
  applicants: string[];
  status: JobStatus;
  createdAt: number;
}

interface JobsState {
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "applicants" | "freelancer" | "status" | "createdAt">) => void;
  applyToJob: (jobId: string, freelancerAddress: string) => void;
  assignFreelancer: (jobId: string, freelancerAddress: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  getJob: (jobId: string) => Job | undefined;
}

const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Build a DeFi Dashboard",
    description: "Create a responsive dashboard for monitoring DeFi positions across multiple protocols. Must include real-time price feeds, portfolio tracking, and yield farming analytics.",
    budget: "2.5",
    deadline: "2026-05-01",
    client: "0x1234...abcd",
    freelancer: null,
    applicants: ["0xaaaa...1111"],
    status: "open",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "2",
    title: "Smart Contract Audit",
    description: "Perform a comprehensive security audit on an ERC-20 token contract and staking mechanism. Deliver a detailed report with findings and recommendations.",
    budget: "5.0",
    deadline: "2026-04-20",
    client: "0x5678...efgh",
    freelancer: null,
    applicants: [],
    status: "open",
    createdAt: Date.now() - 172800000,
  },
  {
    id: "3",
    title: "NFT Marketplace Frontend",
    description: "Design and build a modern NFT marketplace UI with minting, listing, and auction features. Integration with IPFS for metadata storage.",
    budget: "3.0",
    deadline: "2026-05-15",
    client: "0x9abc...ijkl",
    freelancer: "0xbbbb...2222",
    applicants: ["0xbbbb...2222", "0xcccc...3333"],
    status: "funded",
    createdAt: Date.now() - 259200000,
  },
];

const JobsContext = createContext<JobsState | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const addJob = useCallback(
    (job: Omit<Job, "id" | "applicants" | "freelancer" | "status" | "createdAt">) => {
      const newJob: Job = {
        ...job,
        id: Date.now().toString(),
        applicants: [],
        freelancer: null,
        status: "open",
        createdAt: Date.now(),
      };
      setJobs((prev) => [newJob, ...prev]);
    },
    []
  );

  const applyToJob = useCallback((jobId: string, freelancerAddress: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId && !j.applicants.includes(freelancerAddress)
          ? { ...j, applicants: [...j.applicants, freelancerAddress] }
          : j
      )
    );
  }, []);

  const assignFreelancer = useCallback((jobId: string, freelancerAddress: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, freelancer: freelancerAddress, status: "assigned" as JobStatus } : j
      )
    );
  }, []);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  }, []);

  const getJob = useCallback((jobId: string) => jobs.find((j) => j.id === jobId), [jobs]);

  return (
    <JobsContext.Provider value={{ jobs, addJob, applyToJob, assignFreelancer, updateJobStatus, getJob }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
