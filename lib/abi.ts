// lib/abi.ts
// NFT 合约 ABI — 只保留 safeMint(address to)

export const NFT_ABI = [
  {
    inputs: [{ name: "to", type: "address", internalType: "address" }],
    name: "safeMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
