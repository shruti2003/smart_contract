
# Axal On-Chain Reward Verification System

This project implements a simplified on-chain liquidity pool inspired by Aave, integrated with a custom ERC20 token and a verification contract to enable on-chain proof and reward distribution based on APY and TVL thresholds.

## Deployed Contracts on Sepolia Testnet

| Contract                     | Address                                                                                          | Description |
|-----------------------------|--------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| AxalFakeCoin                 | [0xc41e956319306F3a7a91aD2617788615e4BA056C](https://sepolia.etherscan.io/address/0xc41e956319306F3a7a91aD2617788615e4BA056C) | Custom ERC20 token used for rewards and liquidity pool deposits. |
| MiniAxalPool (Aave-inspired) | [0xc3E2fD9C33C42f6dae5ea6a4093A4C5844b1D786](https://sepolia.etherscan.io/address/0xc3E2fD9C33C42f6dae5ea6a4093A4C5844b1D786) | Simplified liquidity pool contract based on AavePool functionality. Tracks TVL and APY. |
| AxalFrontendVerifier        | [0xA39BB4183617E1deA41A27818C711bdbb7c82e4E](https://sepolia.etherscan.io/address/0xA39BB4183617E1deA41A27818C711bdbb7c82e4E) | Verifier contract that reads APY and TVL live on-chain, checks thresholds, and triggers reward distribution. |

## Contract Relationships Overview

```
User Wallet
    │
    ├── Supplies AxalFakeCoin tokens → MiniAxalPool (TVL increases)
    │
    ├── Frontend → AxalFrontendVerifier (verifyAndClaim)
    │            └── Reads TVL and APY from MiniAxalPool
    │            └── Calls AxalFakeCoin.claimReward() on successful verification
    │
    └── Receives AxalFakeCoin rewards upon verification success
```

## Key Features

| Metric | Description |
|---------|------------|
| TVL (Total Value Locked) | Sum of AxalFakeCoin tokens locked in MiniAxalPool. |
| APY (Annual Percentage Yield) | Set at deployment (basis points, e.g., 500 = 5%). |
| Verification | Fully on-chain, handled by AxalFrontendVerifier, no off-chain servers. |

## Contract Usage Instructions

### 1. Supply Tokens to Increase TVL

First, approve the MiniAxalPool to spend your AxalFakeCoin tokens:

```solidity
AxalFakeCoin.approve(0x41c0bAD9D7C1b74e71A26434BCFED7EEF3E718AB, amount);
```

Then supply tokens to the pool:

```solidity
MiniAxalPool.supply(amount);
```

This action increases the TVL on-chain.

### 2. Claim Reward via Frontend Verifier

Call the `verifyAndClaim()` function:

```solidity
AxalFrontendVerifier.verifyAndClaim(customerAddress, apyThreshold, tvlThreshold);
```

- Fetches live APY and TVL from MiniAxalPool.
- Compares values against provided thresholds.
- If conditions are met, triggers reward distribution from AxalFakeCoin.

### 3. View Contracts on Sepolia

- **AxalFakeCoin:**  
[View on Etherscan](https://sepolia.etherscan.io/address/0xc41e956319306F3a7a91aD2617788615e4BA056C)

- **MiniAxalPool (Aave-inspired):**  
[View on Etherscan](https://sepolia.etherscan.io/address/0x41c0bAD9D7C1b74e71A26434BCFED7EEF3E718AB)

- **AxalFrontendVerifier:**  
[View on Etherscan](https://sepolia.etherscan.io/address/0xeA6ae684DDa356a04C5caa237fc9bcA7E29a796F)

## Based On

The MiniAxalPool contract is a simplified version of Aave's Pool contract:
- Tracks total liquidity (TVL) and liquidity rate (APY).
- Provides a `getReserveData()` function similar to Aave's original interface.
- Suitable for testing and fully on-chain reward verification without relying on RPCs or external data feeds.
