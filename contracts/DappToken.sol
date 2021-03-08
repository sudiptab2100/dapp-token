// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
    // Constructor
    // Set & Read the total no of tokens
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 1000000;
    }
}