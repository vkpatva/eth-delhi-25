// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title IDIDValidator
/// @notice Interface for validating and parsing Decentralized Identifiers (DIDs)
/// @dev Used by the Identity Registry or other contracts to ensure a DID is well-formed and correctly bound to an Ethereum address
interface IDIDValidator {
    /**
     * @notice Validate that a DID string is correctly formatted and bound to an expected Ethereum address
     * @dev Pure function, does not modify state
     * @param didString The DID string to validate (e.g., "did:ethr:0x1234...")
     * @param expectedAddress The Ethereum address expected to be bound to the DID
     * @return isValid True if the DID is valid and corresponds to the expected address
     */
    function validateDID(
        string calldata didString,
        address expectedAddress
    ) external pure returns (bool isValid);

    /**
     * @notice Extract an Ethereum address from a DID string
     * @dev Pure function, does not modify state
     * @param didString The DID string to parse (e.g., "did:ethr:0x1234...")
     * @return extractedAddress The address parsed from the DID
     * @return success True if extraction succeeded, false if the DID format was invalid
     */
    function extractAddressFromDID(
        string calldata didString
    ) external pure returns (address extractedAddress, bool success);
}
