import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { paymentMiddleware, Resource } from "x402-express";
import { isAddress } from "viem";
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

  res.json({
    message: "Agent Registered",
    data: {
      agentId: "1234567890",
    },
  });
});

app.listen(4020, () => {
  console.log(`⚡ Server running at http://localhost:4020`);
});
