// Placeholder contract address (deploy your own to Sepolia testnet)
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Placeholder ABI — replace with your deployed contract's ABI
export const ESCROW_ABI = [
  {
    inputs: [
      { name: "freelancer", type: "address" },
    ],
    name: "createJob",
    outputs: [{ name: "jobId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "fundJob",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "releasePayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "getJob",
    outputs: [
      { name: "client", type: "address" },
      { name: "freelancer", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
