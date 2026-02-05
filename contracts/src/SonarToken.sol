// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SonarToken
 * @notice Test token for Base Signal platform (testnet only)
 */
contract SonarToken is ERC20 {
    constructor() ERC20("Sonar", "SONAR") {
        // Mint 100B tokens to deployer
        _mint(msg.sender, 100_000_000_000 * 10**18);
    }
    
    // Faucet function for testing - anyone can mint 1M tokens
    function faucet() external {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}
