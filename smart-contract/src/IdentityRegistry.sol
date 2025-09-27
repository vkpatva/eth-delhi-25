// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./Interface/IIdentityRegistry.sol";
import "./Interface/IDIDValidator.sol";

/**
 * @title AgentRegistry
 * @dev Registry for AI agents with native token registration fee and meta-transaction support
 * @notice This contract manages agent registrations with DIDs and service endpoints
 *
 * Features:
 * - Native token registration fee (0.01 ETH)
 * - EIP-712 signature based registration for gas-less onboarding
 * - Service endpoint management
 * - Agent lookup by address and ID
 *
 * Version: 1.0.0
 * Author: Vkpatva
 */
contract AgentRegistry is IAgentRegistry, EIP712 {
    // ============ Constants ============
    string public constant VERSION = "1.0.0";
    string private constant SIGNING_DOMAIN = "AgentRegistry";
    string private constant SIGNATURE_VERSION = "1";
    // uint256 private constant REGISTRATION_FEE = 0.01 ether;
    uint256 private REGISTRATION_FEE;
    // ============ EIP-712 Typehash ============
    bytes32 private constant AGENT_TYPEHASH =
        keccak256(
            "AgentRegistration(address agent,string did,string description,string serviceEndpoint,uint256 nonce,uint256 expiry)"
        );

    // ============ State Variables ============
    uint256 private _nextAgentId = 1;
    IDIDValidator public immutable didValidator;
    mapping(address => AgentInfo) private _agentsByAddress;
    mapping(uint256 => address) private _addressById;
    mapping(string => uint256) private _didToAgentId; // For DID uniqueness
    mapping(address => uint256) public nonces;

    constructor(
        address validator,
        uint decimals // = 1
    ) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        require(validator != address(0), "Invalid DIDValidator address");
        didValidator = IDIDValidator(validator);
        //  10 ^ 4 = 10000
        REGISTRATION_FEE = (1 * 10) ^ decimals;
    }

    /**
     * @notice Register a new agent with DID and service endpoint
     * @param did Decentralized Identifier
     * @param description Free-form description about the agent
     * @param serviceEndpoint Service endpoint URL for the agent
     */
    function registerAgent(
        string calldata did,
        string calldata description,
        string calldata serviceEndpoint
    ) external payable override {
        require(msg.value >= REGISTRATION_FEE, "Insufficient registration fee");
        require(bytes(did).length > 0, "DID cannot be empty");

        // Check uniqueness and validate DID
        _checkUniqueness(did, msg.sender);
        if (!didValidator.validateDID(did, msg.sender)) {
            revert("DID address mismatch");
        }

        _registerAgent(msg.sender, did, description, serviceEndpoint);
    }
    /**
     * @notice Register agent through a gas payer using EIP-712 signature
     * @param request The forward request containing agent details
     * @param signature EIP-712 signature signed by the agent
     */
    function registerAgentWithSig(
        ForwardRequest calldata request,
        bytes calldata signature
    ) external payable override {
        require(msg.value >= REGISTRATION_FEE, "Insufficient registration fee");
        require(block.timestamp <= request.expiry, "Request expired");
        require(nonces[request.agent] == request.nonce, "Invalid nonce");

        // Check uniqueness and validate DID
        _checkUniqueness(request.did, request.agent);
        if (!didValidator.validateDID(request.did, request.agent)) {
            revert("DID address mismatch");
        }

        // Build struct hash
        bytes32 structHash = keccak256(
            abi.encode(
                AGENT_TYPEHASH,
                request.agent,
                keccak256(bytes(request.did)),
                keccak256(bytes(request.description)),
                keccak256(bytes(request.serviceEndpoint)),
                request.nonce,
                request.expiry
            )
        );

        // Final digest per EIP-712
        bytes32 digest = _hashTypedDataV4(structHash);

        // Recover and verify signer
        address recovered = ECDSA.recover(digest, signature);
        if (recovered != request.agent) revert("Invalid signature");

        nonces[request.agent]++;
        _registerAgent(
            request.agent,
            request.did,
            request.description,
            request.serviceEndpoint
        );
    }

    function updateServiceEndpoint(
        string calldata newEndpoint
    ) external override {
        require(_agentsByAddress[msg.sender].id != 0, "Agent not registered");
        _agentsByAddress[msg.sender].serviceEndpoint = newEndpoint;
        emit ServiceEndpointUpdated(
            _agentsByAddress[msg.sender].id,
            newEndpoint
        );
    }

    function getAgentByAddress(
        address agent
    ) external view override returns (AgentInfo memory) {
        require(_agentsByAddress[agent].id != 0, "Agent not found");
        return _agentsByAddress[agent];
    }

    function getAgentById(
        uint256 agentId
    ) external view override returns (AgentInfo memory) {
        address agent = _addressById[agentId];
        require(agent != address(0), "Agent not found");
        return _agentsByAddress[agent];
    }

    function getAgentDID(
        address agent
    ) external view override returns (string memory) {
        require(_agentsByAddress[agent].id != 0, "Agent not found");
        return _agentsByAddress[agent].did;
    }

    function getAgentServiceEndpoint(
        address agent
    ) external view override returns (string memory) {
        require(_agentsByAddress[agent].id != 0, "Agent not found");
        return _agentsByAddress[agent].serviceEndpoint;
    }

    function _registerAgent(
        address agent,
        string calldata did,
        string calldata description,
        string calldata serviceEndpoint
    ) private {
        uint256 agentId = _nextAgentId++;

        _agentsByAddress[agent] = AgentInfo({
            did: did,
            id: agentId,
            description: description,
            serviceEndpoint: serviceEndpoint
        });

        _addressById[agentId] = agent;
        _didToAgentId[did] = agentId;

        emit AgentRegistered(agent, did, agentId);
    }

    /**
     * @notice Validate uniqueness of DID and address
     */
    function _checkUniqueness(
        string calldata did,
        address agent
    ) internal view {
        if (_agentsByAddress[agent].id != 0) {
            revert("Address already registered");
        }
        if (_didToAgentId[did] != 0) {
            revert("DID already registered");
        }
    }
}
