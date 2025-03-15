import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function App() {
    const [walletBalance, setWalletBalance] = useState("");
    const [response, setResponse] = useState("");
    const [apy, setApy] = useState(5); // Default APY
    const [tvl, setTvl] = useState(5000); // Default TVL
    const [loading, setLoading] = useState(false); // Loading state for button
    const [txHash, setTxHash] = useState(""); // Stores the transaction hash

    // Hardcoded customer receiving rewards
    const customerAddress = "0x1422CF65ee6918eADF2C43a0835e155faed7d707"; 
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/ty7tEtuPQNYCUEzZS09lxVqfcPpmBP7j");

    // Private key wallet (Sender: You)
    const privateKey = "0x70260f0f752d6b509636c9abfea6f680a3f8023ef42086683b968c3760ac119e"; 
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const contractAddress = "0x34cA878703b7d9Ba39679B3FdaC302ed5e2d1F62"; // Update with actual contract address
    const abi = [
        "function claimReward(address customer, uint256 apy, uint256 tvl) external",
        "function getBalance(address user) external view returns (uint256)"
    ];

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    useEffect(() => {
        fetchBalance();
    }, []);

    // Fetch the balance of the CUSTOMER (not sender)
    const fetchBalance = async () => {
        try {
            const balance = await contract.getBalance(customerAddress);
            setWalletBalance(ethers.formatUnits(balance, 18));
        } catch (error) {
            console.error("Error fetching balance:", error);
            setWalletBalance("Error!");
        }
    };

    const claimReward = async () => {
        if (!apy || !tvl) {
            setResponse("❌ Please set APY and TVL thresholds!");
            return;
        }

        setLoading(true); // Start loading state

        try {
            // Send transaction directly to the smart contract
            const tx = await contract.claimReward(customerAddress, parseFloat(apy), parseFloat(tvl));
            await tx.wait();

            setTxHash(tx.hash);
            setResponse(`✅ Reward Claimed!`);

            // Instantly update balance UI while waiting for confirmation
            setWalletBalance((prevBalance) => (parseFloat(prevBalance) + 10).toFixed(2));

            // Fetch actual updated balance in the background (to sync with blockchain)
            setTimeout(fetchBalance, 5000);
        } catch (error) {
            console.error("Error:", error);
            setResponse(`${error.reason || "❌ Transaction failed!"}`);
        }

        setLoading(false); // Stop loading state
    };

    return (
        <div className="app-container">
            <h1 className="title">AxalFakeCoin Reward Portal</h1>

            <div className="input-group">
                <label>APY Threshold: {apy}%</label>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={apy}
                    onChange={(e) => setApy(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label>TVL Threshold: ${tvl}</label>
                <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={tvl}
                    onChange={(e) => setTvl(e.target.value)}
                />
            </div>

            <p className="balance">Customer Wallet Balance: <span>{walletBalance} AXAL</span></p>

            <button
                className="claim-btn"
                onClick={claimReward}
                disabled={loading}
            >
                {loading ? "Processing..." : "Claim Ticket"}
            </button>

            {response && (
                <div className="response-container">
                    <p className={response.includes("❌") ? "error-text" : "success-text"}>{response}</p>
                    
                    {txHash && (
                        <p>
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="etherscan-link"
                            >
                                View Transaction on Sepolia Etherscan
                            </a>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
