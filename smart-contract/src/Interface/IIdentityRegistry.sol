// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAgentRegistry {
    /// @notice Event emitted when new agent is registered
    event AgentRegistered(
        address indexed agent,
        string did,
        uint256 indexed agentId
    );

    /// @notice Event emitted when agent updates their service endpoint
    event ServiceEndpointUpdated(uint256 indexed agentId, string newEndpoint);

    /// @notice Struct to store agent details
    struct AgentInfo {
        string did;
        uint256 id;
        string description;
        string serviceEndpoint;
    }

    /// @notice Struct for EIP-712 signature data
    struct ForwardRequest {
        address agent;
        string did;
        string description;
        string serviceEndpoint;
        uint256 nonce;
        uint256 expiry;
    }

    /// @notice Register a new agent directly by paying registration fee
    /// @param did Agent's DID
    /// @param description Agent's description
    /// @param serviceEndpoint Agent's service endpoint URL
    function registerAgent(
        string calldata did,
        string calldata description,
        string calldata serviceEndpoint
    ) external payable;

    /// @notice Register agent through a gas payer using EIP-712 signature
    /// @param request The forward request containing agent details
    /// @param signature EIP-712 signature signed by the agent
    function registerAgentWithSig(
        ForwardRequest calldata request,
        bytes calldata signature
    ) external payable;

    /// @notice Update agent's service endpoint
    /// @param newEndpoint New service endpoint URL
    function updateServiceEndpoint(string calldata newEndpoint) external;

    /// @notice Get agent details by agent address
    /// @param agent Address of the agent
    /// @return AgentInfo struct containing agent details
    function getAgentByAddress(
        address agent
    ) external view returns (AgentInfo memory);

    /// @notice Get agent details by agent ID
    /// @param agentId ID of the agent
    /// @return AgentInfo struct containing agent details
    function getAgentById(
        uint256 agentId
    ) external view returns (AgentInfo memory);

    /// @notice Get agent's DID
    /// @param agent Address of the agent
    /// @return Agent's DID
    function getAgentDID(address agent) external view returns (string memory);

    /// @notice Get agent's service endpoint
    /// @param agent Address of the agent
    /// @return Agent's service endpoint URL
    function getAgentServiceEndpoint(
        address agent
    ) external view returns (string memory);
}
