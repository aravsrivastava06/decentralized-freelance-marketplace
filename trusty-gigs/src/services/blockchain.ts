/**
 * Blockchain interaction service
 * Uses ethers.js to interact with the escrow smart contract on Sepolia testnet.
 * Replace ESCROW_CONTRACT_ADDRESS with your deployed contract.
 */

import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "@/constants/contract";

export interface BidEvent {
  jobId: string;
  bidder: string;
  amount: string;
  transactionHash?: string;
  timestamp?: number;
}

function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  throw new Error("MetaMask not detected");
}

async function getContract(withSigner = false) {
  const provider = getProvider();
  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
  }
  return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const provider = getProvider();
    const accounts = await provider.send("eth_accounts", []);
    return accounts[0] || null;
  } catch {
    return null;
  }
}

/** Create a job on-chain — sends ETH as escrow */
export async function createJob(freelancerAddress: string, amountEth: string) {
  const contract = await getContract(true);
  const tx = await contract.createJob(freelancerAddress, {
    value: parseEther(amountEth),
  });
  return tx;
}

/** Fund an existing job */
export async function fundJob(jobId: number, amountEth: string) {
  const contract = await getContract(true);
  const tx = await contract.fundJob(jobId, {
    value: parseEther(amountEth),
  });
  return tx;
}

/** Release escrowed payment to freelancer */
export async function releasePayment(jobId: number) {
  const contract = await getContract(true);
  const tx = await contract.releasePayment(jobId);
  return tx;
}

function valueToString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "bigint" || typeof value === "number") return value.toString();
  if (value && typeof value === "object" && "toString" in value) return String(value);
  return "";
}

function parseBidEvent(args: unknown[]): BidEvent {
  const candidate = args[args.length - 1];
  const event = candidate && typeof candidate === "object" ? candidate as Record<string, unknown> : {};
  const eventArgs = Array.isArray(event.args) ? event.args : args;
  const jobId = valueToString(event.jobId ?? eventArgs[0]);
  const bidder = valueToString(event.bidder ?? event.freelancer ?? eventArgs[1]);
  const amountValue = event.amount ?? eventArgs[2];
  let amount = valueToString(amountValue);

  try {
    if (amountValue !== undefined && amountValue !== null) amount = formatEther(amountValue as bigint);
  } catch {
    // Some test contracts expose an already formatted amount.
  }

  return {
    jobId,
    bidder,
    amount,
    transactionHash: typeof event.transactionHash === "string" ? event.transactionHash : undefined,
  };
}

export async function getBidPlacedEvents(address: string): Promise<BidEvent[]> {
  if (!address) return [];
  const contract = await getContract();
  const logs = await contract.queryFilter(contract.filters.BidPlaced(null, address));
  return logs.map((log) => parseBidEvent([log]));
}

export async function subscribeToBidPlaced(listener: (event: BidEvent) => void) {
  const contract = await getContract();
  const handler = (...args: unknown[]) => listener(parseBidEvent(args));
  contract.on("BidPlaced", handler);
  return () => {
    void contract.off("BidPlaced", handler);
  };
}

export async function subscribeToBidAccepted(listener: (event: BidEvent) => void) {
  const contract = await getContract();
  const handler = (...args: unknown[]) => listener(parseBidEvent(args));
  contract.on("BidAccepted", handler);
  return () => {
    void contract.off("BidAccepted", handler);
  };
}

export { getProvider };
