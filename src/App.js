import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function App() {
    const [walletBalance, setWalletBalance] = useState("");
    const [response, setResponse] = useState("");
    const [apy, setApy] = useState(5); // Default APY
    const [tvl, setTvl] = useState(5000); // Default TVL
    const [loading, setLoading] = useState(false); 
    const [txHash, setTxHash] = useState(""); 

    const customerAddress = "0x1422CF65ee6918eADF2C43a0835e155faed7d707"; 
    const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/ty7tEtuPQNYCUEzZS09lxVqfcPpmBP7j");

    const privateKey = "0x70260f0f752d6b509636c9abfea6f680a3f8023ef42086683b968c3760ac119e"; 
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const contractAddress = "0x19Be63204D9ccd8eC1C53Bd0c68b2D0AF872fF73"; // Verifier contract

    const abi = [
        "function verifyAndClaim(address customer, uint256 apyThreshold, uint256 tvlThreshold) external",
        "function getCurrentPoolData() external view returns (uint256, uint256)" 
    ];

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const tokenAddress = "0xc41e956319306F3a7a91aD2617788615e4BA056C"; 
    const tokenAbi = [
        "function getBalance(address user) external view returns (uint256)"
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    useEffect(() => {
      fetchBalance();
      fetchCurrentPoolData(); // Add this call here to print when page loads
    }, []);
  

    // Fetch the balance of the customer
    const fetchBalance = async () => {
        try {
            console.log(`🔎 Fetching balance for ${customerAddress}...`);
            const balance = await tokenContract.getBalance(customerAddress);
            console.log(`✅ Current Balance: ${ethers.formatUnits(balance, 18)} AXAL`);
            setWalletBalance(ethers.formatUnits(balance, 18));
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
            setWalletBalance("Error!");
        }
    };

    // Fetch current APY/TVL data from Verifier contract
    const fetchCurrentPoolData = async () => {
      try {
          console.log(`🔎 Fetching current APY & TVL from pool at: ${contract.address}...`);
          const [currentTVL, currentAPY] = await contract.getCurrentPoolData();
  
          console.log(`📊 Raw Pool Data:`, { currentTVL, currentAPY });
  
          // Convert BigInt to JS Number safely
          const apyValue = Number(currentAPY);
          const tvlValue = ethers.formatUnits(currentTVL, 18); // Already string formatted
  
          console.log(`✅ Pool APY: ${apyValue} basis points (${apyValue / 100}% APR)`);
          console.log(`✅ Pool TVL: ${tvlValue} Tokens`);
      } catch (error) {
          console.error("❌ Error fetching pool data:", error);
      }
  };
  
  
  

    // Claim reward function
    const claimReward = async () => {
        if (!apy || !tvl) {
            setResponse("❌ Please set APY and TVL thresholds!");
            return;
        }

        console.log(`🚀 Starting reward claim...`);
        console.log(`📊 Thresholds: APY >= ${apy}%, TVL >= ${tvl}`);
        console.log(`📩 Calling verifyAndClaim with customer: ${customerAddress}`);

        setLoading(true);

        try {
            const tx = await contract.verifyAndClaim(customerAddress, parseFloat(apy), parseFloat(tvl));
            console.log(`⏳ Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`✅ Transaction confirmed: ${tx.hash}`);

            await fetchCurrentPoolData(); // <-- Fetch updated pool data


            setTxHash(tx.hash);
            setResponse(`✅ Reward Claimed!`);

            // Update balance UI instantly
            setWalletBalance((prevBalance) => (parseFloat(prevBalance) + 10).toFixed(2));

            // Fetch actual updated balance in the background
            setTimeout(fetchBalance, 5000);
        } catch (error) {
            console.error("❌ Error:", error);
            setResponse(`${error.reason || "❌ Transaction failed!"}`);
        }

        setLoading(false);
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
