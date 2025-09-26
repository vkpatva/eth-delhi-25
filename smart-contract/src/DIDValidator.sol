// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Interface/IDIDValidator.sol";
/**
 * @title DIDValidator
 * @dev Validates Decentralized Identifiers (DIDs) for Ethereum addresses
 * @notice Provides DID validation functionality with detailed debugging capabilities
 * @author Vkpatva - ZKred
 */
contract DIDValidator is IDIDValidator {
    // ============ Structs ============

    struct ValidationResult {
        string base58Identifier;
        bytes decodedData;
        uint256 decodedDataLength;
        bytes zeroPaddingBytes;
        bytes extractedAddressBytes;
        address parsedAddress;
        bool isEthereumControlled;
        bool addressMatches;
    }

    // ============ Constants ============

    /// @notice Base58 character '1' representing zero
    bytes1 private constant BASE58_ZERO = 0x31;

    /// @notice Expected length of decoded DID data for Ethereum-controlled identities
    uint256 private constant EXPECTED_DECODED_LENGTH = 31;

    /// @notice Number of expected colons in a valid DID format
    uint256 private constant EXPECTED_COLON_COUNT = 4;

    /// @notice Length of Ethereum address in bytes
    uint256 private constant ADDRESS_BYTE_LENGTH = 20;

    /// @notice Start position of zero padding in decoded data
    uint256 private constant ZERO_PADDING_START = 2;

    /// @notice Length of zero padding section
    uint256 private constant ZERO_PADDING_LENGTH = 7;

    /// @notice Start position of address data in decoded bytes
    uint256 private constant ADDRESS_DATA_START = 9;

    // ============ Public Functions ============

    /**
     * @notice Validate a DID against an expected Ethereum address
     * @param didString The complete DID string to validate
     * @param expectedAddress The Ethereum address that should match
     * @return isValid True if the DID is valid and matches the expected address
     */
    function validateDID(
        string calldata didString,
        address expectedAddress
    ) external pure returns (bool isValid) {
        ValidationResult memory result = _validateDIDWithDetails(
            didString,
            expectedAddress
        );
        return
            result.addressMatches &&
            result.isEthereumControlled &&
            result.decodedDataLength == EXPECTED_DECODED_LENGTH;
    }

    /**
     * @notice Get detailed validation information for debugging purposes
     * @param didString The complete DID string to analyze
     * @param expectedAddress The expected Ethereum address
     * @return validationResult Detailed breakdown of the validation process
     */
    function getValidationDetails(
        string calldata didString,
        address expectedAddress
    ) external pure returns (ValidationResult memory validationResult) {
        return _validateDIDWithDetails(didString, expectedAddress);
    }

    /**
     * @notice Extract Ethereum address from a DID string
     * @param didString The complete DID string
     * @return extractedAddress The Ethereum address embedded in the DID
     * @return success True if extraction was successful
     */
    function extractAddressFromDID(
        string calldata didString
    ) external pure returns (address extractedAddress, bool success) {
        ValidationResult memory result = _validateDIDWithDetails(
            didString,
            address(0)
        );

        if (
            result.isEthereumControlled &&
            result.decodedDataLength == EXPECTED_DECODED_LENGTH
        ) {
            return (result.parsedAddress, true);
        }

        return (address(0), false);
    }

    // ============ Internal Functions ============

    /**
     * @dev Perform detailed DID validation with comprehensive result data
     * @param didString The complete DID string
     * @param expectedAddress The expected Ethereum address
     * @return result Complete validation result with debugging information
     */
    function _validateDIDWithDetails(
        string calldata didString,
        address expectedAddress
    ) internal pure returns (ValidationResult memory result) {
        bytes memory didBytes = bytes(didString);

        // Extract base58 identifier from DID
        string memory base58Id = _extractBase58Identifier(didBytes);
        result.base58Identifier = base58Id;

        if (bytes(base58Id).length == 0) {
            return result; // Invalid DID format
        }

        // Decode base58 identifier
        bytes memory decodedData = _decodeBase58(bytes(base58Id));
        result.decodedData = decodedData;
        result.decodedDataLength = decodedData.length;

        if (decodedData.length != EXPECTED_DECODED_LENGTH) {
            return result; // Invalid decoded length
        }

        // Extract and validate zero padding
        result.zeroPaddingBytes = _extractZeroPadding(decodedData);
        result.isEthereumControlled = _validateZeroPadding(decodedData);

        if (!result.isEthereumControlled) {
            return result; // Not Ethereum-controlled
        }

        // Extract Ethereum address
        result.extractedAddressBytes = _extractAddressBytes(decodedData);
        result.parsedAddress = _convertBytesToAddress(decodedData);

        // Check if addresses match
        result.addressMatches = (result.parsedAddress == expectedAddress);

        return result;
    }

    /**
     * @dev Extract base58 identifier from DID string
     * @param didBytes The DID as bytes
     * @return base58Id The extracted base58 identifier
     */
    function _extractBase58Identifier(
        bytes memory didBytes
    ) internal pure returns (string memory base58Id) {
        uint256 lastColonIndex = 0;
        uint256 colonCount = 0;

        // Find the 4th colon to locate base58 part
        for (uint256 i = 0; i < didBytes.length; i++) {
            if (didBytes[i] == ":") {
                colonCount++;
                if (colonCount == EXPECTED_COLON_COUNT) {
                    lastColonIndex = i;
                    break;
                }
            }
        }

        if (colonCount != EXPECTED_COLON_COUNT) {
            return ""; // Invalid format
        }

        // Extract base58 identifier
        uint256 base58Start = lastColonIndex + 1;
        bytes memory base58Bytes = new bytes(didBytes.length - base58Start);

        for (uint256 i = 0; i < base58Bytes.length; i++) {
            base58Bytes[i] = didBytes[base58Start + i];
        }

        return string(base58Bytes);
    }

    /**
     * @dev Extract zero padding bytes from decoded data
     * @param decodedData The decoded DID data
     * @return paddingBytes The zero padding section
     */
    function _extractZeroPadding(
        bytes memory decodedData
    ) internal pure returns (bytes memory paddingBytes) {
        if (decodedData.length < ZERO_PADDING_START + ZERO_PADDING_LENGTH) {
            return new bytes(0);
        }

        paddingBytes = new bytes(ZERO_PADDING_LENGTH);
        for (uint256 i = 0; i < ZERO_PADDING_LENGTH; i++) {
            paddingBytes[i] = decodedData[ZERO_PADDING_START + i];
        }

        return paddingBytes;
    }

    /**
     * @dev Validate that the zero padding section is all zeros
     * @param decodedData The decoded DID data
     * @return isValid True if zero padding is valid
     */
    function _validateZeroPadding(
        bytes memory decodedData
    ) internal pure returns (bool isValid) {
        if (decodedData.length < ZERO_PADDING_START + ZERO_PADDING_LENGTH) {
            return false;
        }

        for (
            uint256 i = ZERO_PADDING_START;
            i < ZERO_PADDING_START + ZERO_PADDING_LENGTH;
            i++
        ) {
            if (decodedData[i] != 0) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Extract address bytes from decoded data
     * @param decodedData The decoded DID data
     * @return addressBytes The extracted address bytes
     */
    function _extractAddressBytes(
        bytes memory decodedData
    ) internal pure returns (bytes memory addressBytes) {
        if (decodedData.length < ADDRESS_DATA_START + ADDRESS_BYTE_LENGTH) {
            return new bytes(0);
        }

        addressBytes = new bytes(ADDRESS_BYTE_LENGTH);
        for (uint256 i = 0; i < ADDRESS_BYTE_LENGTH; i++) {
            addressBytes[i] = decodedData[ADDRESS_DATA_START + i];
        }

        return addressBytes;
    }

    /**
     * @dev Convert decoded bytes to Ethereum address
     * @param decodedData The decoded DID data
     * @return ethAddress The extracted Ethereum address
     */
    function _convertBytesToAddress(
        bytes memory decodedData
    ) internal pure returns (address ethAddress) {
        if (decodedData.length < ADDRESS_DATA_START + ADDRESS_BYTE_LENGTH) {
            return address(0);
        }

        bytes32 addressBytes32;
        assembly {
            // Load 32 bytes starting from position: 32 (array header) + ADDRESS_DATA_START
            addressBytes32 := mload(
                add(decodedData, add(32, ADDRESS_DATA_START))
            )
        }

        // Convert bytes32 to address by shifting right 96 bits (32 - 20 = 12 bytes = 96 bits)
        ethAddress = address(uint160(uint256(addressBytes32 >> 96)));

        return ethAddress;
    }

    /**
     * @dev Decode base58 string to bytes array
     * @param inputData The base58 encoded data
     * @return decodedBytes The decoded byte array
     */
    function _decodeBase58(
        bytes memory inputData
    ) internal pure returns (bytes memory decodedBytes) {
        if (inputData.length == 0) {
            return new bytes(0);
        }

        // Count leading zeros ('1' characters in base58)
        uint256 leadingZeroCount = 0;
        for (
            uint256 i = 0;
            i < inputData.length && inputData[i] == BASE58_ZERO;
            i++
        ) {
            leadingZeroCount++;
        }

        // Estimate output size
        uint256 estimatedSize = ((inputData.length * 733) / 1000) + 1;
        bytes memory workingBuffer = new bytes(estimatedSize);

        // Process each base58 character
        for (uint256 i = leadingZeroCount; i < inputData.length; i++) {
            uint256 characterValue = _getBase58CharacterValue(inputData[i]);
            if (characterValue == 255) {
                return new bytes(0); // Invalid character found
            }

            // Multiply existing result by 58 and add current character value
            uint256 carry = characterValue;
            for (uint256 j = estimatedSize; j > 0; j--) {
                carry += uint256(uint8(workingBuffer[j - 1])) * 58;
                workingBuffer[j - 1] = bytes1(uint8(carry % 256));
                carry /= 256;
            }

            if (carry != 0) {
                return new bytes(0); // Overflow occurred
            }
        }

        // Find first non-zero byte in result
        uint256 firstNonZeroIndex = 0;
        while (
            firstNonZeroIndex < estimatedSize &&
            workingBuffer[firstNonZeroIndex] == 0
        ) {
            firstNonZeroIndex++;
        }

        // Construct final result with leading zeros and significant bytes
        uint256 resultLength = leadingZeroCount +
            (estimatedSize - firstNonZeroIndex);
        decodedBytes = new bytes(resultLength);

        // Add leading zeros
        for (uint256 i = 0; i < leadingZeroCount; i++) {
            decodedBytes[i] = 0;
        }

        // Copy significant bytes
        for (uint256 i = firstNonZeroIndex; i < estimatedSize; i++) {
            decodedBytes[
                leadingZeroCount + (i - firstNonZeroIndex)
            ] = workingBuffer[i];
        }

        return decodedBytes;
    }

    /**
     * @dev Convert base58 character to its numeric value
     * @param character The base58 character
     * @return value The numeric value (0-57) or 255 for invalid characters
     */
    function _getBase58CharacterValue(
        bytes1 character
    ) internal pure returns (uint256 value) {
        uint8 charCode = uint8(character);

        // '1'-'9' -> 0-8
        if (charCode >= 0x31 && charCode <= 0x39) {
            return charCode - 0x31;
        }

        // 'A'-'H' -> 9-16
        if (charCode >= 0x41 && charCode <= 0x48) {
            return charCode - 0x41 + 9;
        }

        // 'J'-'N' -> 17-21 (skipping 'I')
        if (charCode >= 0x4A && charCode <= 0x4E) {
            return charCode - 0x4A + 17;
        }

        // 'P'-'Z' -> 22-32 (skipping 'O')
        if (charCode >= 0x50 && charCode <= 0x5A) {
            return charCode - 0x50 + 22;
        }

        // 'a'-'k' -> 33-43
        if (charCode >= 0x61 && charCode <= 0x6B) {
            return charCode - 0x61 + 33;
        }

        // 'm'-'z' -> 44-57 (skipping 'l')
        if (charCode >= 0x6D && charCode <= 0x7A) {
            return charCode - 0x6D + 44;
        }

        return 255; // Invalid character
    }
}
