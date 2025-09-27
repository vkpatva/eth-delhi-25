import { NextResponse } from "next/server";
import { CHAINS } from "@/config/chains";
import { ethers } from "ethers";
import { providers } from "ethers";
import AgentRegistryABI from "@/abis/AgentRegistry.json";

// Maximum number of agents to fetch in a single batch
const MAX_AGENTS = 1000; // Set a reasonable limit to prevent excessive loading

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId") || "polygonAmoy";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    console.log("Fetching agents for chain ID:", chainId);

    const chain = CHAINS[chainId as keyof typeof CHAINS];
    if (!chain) {
      return NextResponse.json({ error: "Invalid chain ID" }, { status: 400 });
    }
    console.log("Chain details:", chain);

    // Configure the provider with explicit network settings
    const provider = new providers.JsonRpcProvider({
      url: chain.rpcUrl,
      skipFetchSetup: true
    });
    
    // Set a reasonable polling interval (in ms)
    provider.pollingInterval = 10_000;

    try {
      // Get network info
      const network = await provider.getNetwork();
      console.log("Connected to network:", {
        name: network.name,
        chainId: network.chainId,
        network: network.name
      });
    } catch (networkError) {
      console.error("Network verification failed:", networkError);
      console.warn("Continuing with provided network details despite verification failure");
    }

    // Create contract instance
    const contract = new ethers.Contract(
      chain.contractAddress,
      AgentRegistryABI,
      provider
    );

    const agents = [];
    const allAgents = [];
    
    // First, fetch all agent IDs to calculate pagination
    let totalAgents = 0;
    for (let i = 1; i <= MAX_AGENTS; i++) {
      try {
        const agent = await contract.getAgentById(i);
        if (agent && agent.id.toString() !== "0") {
          allAgents.push(agent);
        } else {
          // Assuming agents are sequential, if we hit an empty slot, we've reached the end
          break;
        }
      } catch (error) {
        console.error(`Error fetching agent ${i}:`, error);
        break;
      }
    }
    
    totalAgents = allAgents.length;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalAgents);
    const paginatedAgents = allAgents.slice(startIndex, endIndex).map(agent => ({
      id: agent.id.toString(),
      did: agent.did,
      description: agent.description,
      serviceEndpoint: agent.serviceEndpoint,
    }));

    return NextResponse.json({
      data: paginatedAgents,
      pagination: {
        total: totalAgents,
        page,
        limit,
        totalPages: Math.ceil(totalAgents / limit),
        hasNextPage: endIndex < totalAgents,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/agents:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const chain = CHAINS[chainId as keyof typeof CHAINS];

    return NextResponse.json(
      {
        error: "Failed to fetch agents",
        details: errorMessage,
        chainId,
        rpcUrl: chain?.rpcUrl || "Not available",
      },
      { status: 500 }
    );
  }
}
