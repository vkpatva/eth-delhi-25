// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "../src/IdentityRegistry.sol";
import "../src/DIDValidator.sol";

/**
 * @title Deploy
 * @dev Deployment script for ERC-8004 Trustless Agents Reference Implementation
 * @notice Deploys DIDValidator first, then IdentityRegistry (using DIDValidator)
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log(
            "Deploying ERC-8004 Trustless Agents Reference Implementation..."
        );
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        // 1. Deploy DIDValidator
        console.log("\n1. Deploying DIDValidator...");
        DIDValidator didValidator = new DIDValidator();
        console.log("DIDValidator deployed at:", address(didValidator));
        // address DIDValidator = address(
        //     0x2846653CCc036Db6F1dB305b2665c1d11F9d9381
        // );

        // for hedera - it should be 6
        // for amoy - it should be 16
        // for og - it should be 16
        // 2. Deploy IdentityRegistry with DIDValidator dependency
        console.log("\n2. Deploying IdentityRegistry...");
        AgentRegistry identityRegistry = new AgentRegistry(
            address(didValidator),
            16
        );
        console.log("IdentityRegistry deployed at:", address(identityRegistry));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("DIDValidator:", address(didValidator));
        console.log("IdentityRegistry:", address(identityRegistry));
    }
}
