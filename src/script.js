const { ethers } = require("ethers");

const AAVE_LENDING_POOL = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
const ABI = ["function getReservesList() external view returns (address[])"];
const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/ty7tEtuPQNYCUEzZS09lxVqfcPpmBP7j");

const AAVE_ABI = [
    "function getReserveData(address asset) external view returns (uint256,uint128,uint128,uint128,uint128,uint128,uint40,uint16,uint128,uint128,uint128,address)"
];

async function getAPY(asset) {
    const aavePool = new ethers.Contract(AAVE_LENDING_POOL, AAVE_ABI, provider);
    const reserveData = await aavePool.getReserveData(asset);
    
    const liquidityRate = reserveData[2]; // APY (RAY format)
    const apy = (liquidityRate * 100) / 10**27; // Convert to percentage

    console.log(`APY for ${asset}: ${apy.toFixed(2)}%`);
}

getAPY("0x6B175474E89094C44Da98b954EedeAC495271d0F"); // Example: DAI

