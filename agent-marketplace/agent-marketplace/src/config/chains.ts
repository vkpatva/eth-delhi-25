export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  contractAddress: string;
  explorerUrl: string;
  testnet: boolean;
}

export const CHAINS: Record<string, ChainConfig> = {
  polygonAmoy: {
    id: 80002,
    name: "Polygon Amoy",
    rpcUrl:
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
      "https://polygon-amoy-bor.publicnode.com",
    contractAddress:
      process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS ||
      "0xF663447E650A3bcdc041A4dD00c2cD88a1B19bB6",
    explorerUrl: "https://amoy.polygonscan.com",
    testnet: true,
  },
  hederaTestnet: {
    id: 296, // Hedera Testnet chain ID
    name: "Hedera Testnet",
    rpcUrl: "https://testnet.hashio.io/api",
    contractAddress: "0x0E8095137f57BE708A130D264874B91737C12fe4",
    explorerUrl: "https://hashscan.io/testnet",
    testnet: true,
  },
  ogTestNet: {
    id: 16602,
    name: "OG Testnet",
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    contractAddress: "0x73697bc046072064eb5bcd0d30bd47ec92b1ea0e",
    explorerUrl: "https://evmtestnet.0g.ai",
    testnet: true,
  },
};

export const DEFAULT_CHAIN = "polygonAmoy";

export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return Object.values(CHAINS).find((chain) => chain.id === chainId);
};
