import { BrowserProvider, Contract, parseEther } from "ethers";
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from "@/constants/contract";

//  Supported chains
const SUPPORTED_CHAIN_ID = 11155111; // Sepolia

function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  throw new Error("MetaMask not detected");
}

//  Ensure correct network
async function checkNetwork() {
  const provider = getProvider();
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== SUPPORTED_CHAIN_ID) {
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia hex
      });
    } catch (error: any) {
      throw new Error("Please switch MetaMask to Sepolia network");
    }
  }
}

async function getContract(withSigner = false) {
  await checkNetwork(); //  enforce network

  const provider = getProvider();

  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
  }

  return new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider);
}

//  Connect wallet
export async function connectWallet(): Promise<string> {
  await checkNetwork();

  const provider = getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

//  Get wallet
export async function getWalletAddress(): Promise<string | null> {
  try {
    const provider = getProvider();
    const accounts = await provider.send("eth_accounts", []);
    return accounts[0] || null;
  } catch {
    return null;
  }
}

//  Create job
export async function createJob(freelancerAddress: string, amountEth: string) {
  const contract = await getContract(true);

  const tx = await contract.createJob(freelancerAddress, {
    value: parseEther(amountEth),
  });

  await tx.wait(); //  wait for confirmation
  return tx;
}

//  Fund job
export async function fundJob(jobId: number, amountEth: string) {
  const contract = await getContract(true);

  const tx = await contract.fundJob(jobId, {
    value: parseEther(amountEth),
  });

  await tx.wait();
  return tx;
}

//  Release payment
export async function releasePayment(jobId: number) {
  const contract = await getContract(true);

  const tx = await contract.releasePayment(jobId);

  await tx.wait();
  return tx;
}

export { getProvider };