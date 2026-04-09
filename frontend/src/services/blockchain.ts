/**
 * Blockchain interaction service
 * Uses ethers.js to interact with the escrow smart contract on Sepolia testnet.
 * Replace ESCROW_CONTRACT_ADDRESS with your deployed contract.
 */

import { BrowserProvider, Contract, parseEther } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "@/constants/contract";

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

export { getProvider };
