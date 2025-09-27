import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { paymentMiddleware, Resource } from "x402-express";
import { isAddress } from "viem";
import { ethers, Wallet } from "ethers";
import type { Address } from "viem";

dotenv.config();
const RECEIVING_WALLET_ADDRESS = process.env.RECEIVING_WALLET_ADDRESS;
if (!RECEIVING_WALLET_ADDRESS || !isAddress(RECEIVING_WALLET_ADDRESS)) {
  throw new Error(
    "RECEIVING_WALLET_ADDRESS env var is missing or invalid. It must be a 0x-prefixed EVM address."
  );
}
const RECEIVING_WALLET_ADDRESS_TYPED = RECEIVING_WALLET_ADDRESS as Address;
const app = express();
app.use(cors());
app.use(express.json());

app.use(cors());
app.use(express.json());

app.use(
  paymentMiddleware(
    RECEIVING_WALLET_ADDRESS_TYPED, // your receiving wallet
    {
      "POST /register": {
        price: "$0.001", // cost in USDC
        network: "polygon-amoy", // testnet network
      },
    },
    { url: "https://x402.polygon.technology" } // Facilitator URL
  )
);

app.post("/register", async (req: Request, res: Response) => {
  const sig = req.body.signature;
  const chainId = req.body.chainId;
  const address = req.body.address;
  const sigBody = req.body.signatureBody;
  const forwarderPrivateKey = process.env.FORWARDER_KEY;
  if (!forwarderPrivateKey) {
    throw new Error("FORWARDER_KEY env var is missing");
  }
  let rpc_url;
  let IdentityRegistry;
  if (chainId == 80002) {
    IdentityRegistry = "0xF663447E650A3bcdc041A4dD00c2cD88a1B19bB6";
    rpc_url = "https://rpc.amoy.polygon.technology";
  } else if (chainId == 11155111) {
    IdentityRegistry = "0x662d9dBA853d407F58285b1ad494909dB630cd42";
    rpc_url = "https://rpc.sepolia.etherscan.io";
  } else {
    throw new Error("Unsupported chainId");
  }
  const abi = [
    "function registerAgentWithSig((address agent, string did, string description, string serviceEndpoint, uint256 nonce, uint256 expiry) request, bytes signature) external payable",
    "function nonces(address) view returns (uint256)",
    "function getAgentByAddress(address agent) view returns (tuple(string did, uint256 id, string description, string serviceEndpoint))",
  ];
  const provider = new ethers.JsonRpcProvider(rpc_url);
  const forwarder = new Wallet(forwarderPrivateKey, provider);
  const registry = new ethers.Contract(IdentityRegistry, abi, forwarder);
  const registrationFee = ethers.parseEther("0.01");
  const tx = await registry.registerAgentWithSig(sigBody, sig, {
    value: registrationFee,
  });
  const agent = await registry.getAgentByAddress(address);

  res.json({
    message: "Agent Registered",
    data: {
      hash: tx.hash,
      agentId: agent.id,
    },
  });
});

app.listen(4020, () => {
  console.log(`⚡ Server running at http://localhost:4020`);
});
