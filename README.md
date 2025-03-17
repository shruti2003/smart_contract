
# Axal On-Chain Reward Verification System (Sepolia Testnet)

This project implements a fully on-chain reward verification system on the **Sepolia Testnet**, integrating:

- A simplified liquidity pool inspired by Aave
- A custom ERC20 token (`AxalFakeCoin`)
- A verifier smart contract for APY/TVL threshold checks and reward distribution
- **Mocked RiscZero zero-knowledge proof logic** (RiscZero zkVM integration planned, but limited by local system constraints)

## Deployed Contracts on Sepolia

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
| **TVL (Total Value Locked)** | Sum of AxalFakeCoin tokens locked in MiniAxalPool. |
| **APY (Annual Percentage Yield)** | Set at deployment (basis points, e.g., 500 = 5%). |
| **Verification** | Fully on-chain, handled by AxalFrontendVerifier, no web2 backend. |
| **Zero Knowledge Proof** | **Mocked RiscZero zkVM logic due to local system buffer limitations.** Intended to integrate real zkVM proofs in future updates. |

## Contract Usage Instructions

### 1. Supply Tokens to Increase TVL

First, approve the MiniAxalPool to spend your AxalFakeCoin tokens:

```solidity
AxalFakeCoin.approve(0xc3E2fD9C33C42f6dae5ea6a4093A4C5844b1D786, amount);
```

Then supply tokens to the pool:

```solidity
MiniAxalPool.supply(amount);
```

### 2. Claim Reward via Frontend Verifier

Call:

```solidity
AxalFrontendVerifier.verifyAndClaim(customerAddress, apyThreshold, tvlThreshold);
```

### 3. Contract Links (Sepolia)

- **AxalFakeCoin:**  
[View on Etherscan](https://sepolia.etherscan.io/address/0xc41e956319306F3a7a91aD2617788615e4BA056C)

- **MiniAxalPool (Aave-inspired):**  
[View on Etherscan](https://sepolia.etherscan.io/address/0xc3E2fD9C33C42f6dae5ea6a4093A4C5844b1D786)

- **AxalFrontendVerifier:**  
[View on Etherscan](https://sepolia.etherscan.io/address/0xA39BB4183617E1deA41A27818C711bdbb7c82e4E)

---

## Mocked ZK Proof Implementation

Due to local system buffer constraints, RiscZero zkVM could not be successfully executed. Instead, a **mock zero-knowledge proof (ZKP)** using Rust and SHA256 hashing logic was implemented to simulate proof generation and verification.

**Planned Update:**  
Full integration of RiscZero zkVM (using Groth16 and zk-STARKs) once system limitations are resolved.
