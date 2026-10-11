import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";
import { subscribeToBidAccepted, subscribeToBidPlaced } from "@/services/blockchain";
import { useWeb3 } from "@/contexts/Web3Context";

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

export interface ActivityNotification {
  id: string;
  type: "bid" | "accepted";
  jobId: string;
  message: string;
  createdAt: number;
  read: boolean;
}

interface JobsState {
  jobs: Job[];
  addJob: (job: Omit<Job, "id" | "applicants" | "freelancer" | "status" | "createdAt">) => void;
  applyToJob: (jobId: string, freelancerAddress: string) => void;
  assignFreelancer: (jobId: string, freelancerAddress: string) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  updateJobDescription: (jobId: string, description: string) => void;
  repostJob: (jobId: string) => void;
  getJob: (jobId: string) => Job | undefined;
  notifications: ActivityNotification[];
  unreadNotifications: number;
  markNotificationsRead: () => void;
}

const DESCRIPTION_OVERRIDES_KEY = "chainwork-job-descriptions";

function readDescriptionOverrides() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try {
    return JSON.parse(localStorage.getItem(DESCRIPTION_OVERRIDES_KEY) || "{}") as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
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
  const { address } = useWeb3();
  const [jobs, setJobs] = useState<Job[]>(() => {
    const overrides = readDescriptionOverrides();
    return MOCK_JOBS.map((job) => ({ ...job, description: overrides[job.id] || job.description }));
  });
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

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

  const updateJobDescription = useCallback((jobId: string, description: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, description } : j)));
    const overrides = readDescriptionOverrides();
    overrides[jobId] = description;
    localStorage.setItem(DESCRIPTION_OVERRIDES_KEY, JSON.stringify(overrides));
  }, []);

  const repostJob = useCallback((jobId: string) => {
    setJobs((prev) => {
      const original = prev.find((job) => job.id === jobId);
      if (!original) return prev;
      const reposted: Job = {
        ...original,
        id: `${Date.now()}`,
        applicants: [],
        freelancer: null,
        status: "open",
        createdAt: Date.now(),
      };
      return [reposted, ...prev];
    });
  }, []);

  const addNotification = useCallback((notification: ActivityNotification) => {
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) return prev;
      return [notification, ...prev].slice(0, 30);
    });
  }, []);

  useEffect(() => {
    if (!address) return;
    let active = true;
    const cleanups: Array<() => void> = [];
    const ownAddress = address.toLowerCase();

    const handleBid = (event: { jobId: string; bidder: string; amount: string; transactionHash?: string }) => {
      const job = jobsRef.current.find((item) => item.id === event.jobId);
      if (!job || job.client.toLowerCase() !== ownAddress) return;
      const notification: ActivityNotification = {
        id: `bid-${event.jobId}-${event.transactionHash || event.bidder}`,
        type: "bid",
        jobId: event.jobId,
        message: `New bid of ${event.amount || "an unknown amount"} ETH on ${job.title}`,
        createdAt: Date.now(),
        read: false,
      };
      addNotification(notification);
      toast.info(notification.message);
    };

    const handleAccepted = (event: { jobId: string; bidder: string; transactionHash?: string }) => {
      if (event.bidder.toLowerCase() !== ownAddress) return;
      const job = jobsRef.current.find((item) => item.id === event.jobId);
      const notification: ActivityNotification = {
        id: `accepted-${event.jobId}-${event.transactionHash || event.bidder}`,
        type: "accepted",
        jobId: event.jobId,
        message: `Your bid was accepted${job ? ` for ${job.title}` : ""}`,
        createdAt: Date.now(),
        read: false,
      };
      addNotification(notification);
      toast.success(notification.message);
    };

    const listen = async () => {
      try {
        const cleanup = await subscribeToBidPlaced(handleBid);
        if (active) cleanups.push(cleanup);
        else cleanup();
      } catch {
        // A wallet provider or deployed contract is optional in demo mode.
      }
      try {
        const cleanup = await subscribeToBidAccepted(handleAccepted);
        if (active) cleanups.push(cleanup);
        else cleanup();
      } catch {
        // A contract without the optional acceptance event remains usable.
      }
    };
    void listen();

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [address, addNotification]);

  const getJob = useCallback((jobId: string) => jobs.find((j) => j.id === jobId), [jobs]);
  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        addJob,
        applyToJob,
        assignFreelancer,
        updateJobStatus,
        updateJobDescription,
        repostJob,
        getJob,
        notifications,
        unreadNotifications: notifications.filter((item) => !item.read).length,
        markNotificationsRead,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error("useJobs must be used within JobsProvider");
  return ctx;
}
