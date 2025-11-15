require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // Arbitrum Sepolia (Arc Testnet) with Real Circle USDC
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    // Arbitrum Mainnet with Real Circle USDC
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc-testnet.arc.network",
      chainId: 42170,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    arcMainnet: {
      url: process.env.ARC_MAINNET_RPC_URL || "https://rpc.arc.network",
      chainId: 42161,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY || "no-api-key-needed",
      arbitrum: process.env.ARBISCAN_API_KEY || "no-api-key-needed",
      arcTestnet: process.env.ARC_EXPLORER_API_KEY || "no-api-key-needed",
      arcMainnet: process.env.ARC_EXPLORER_API_KEY || "no-api-key-needed",
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
      {
        network: "arcTestnet",
        chainId: 42170,
        urls: {
          apiURL: "https://api-testnet.arcscan.com/api",
          browserURL: "https://testnet.arcscan.com",
        },
      },
      {
        network: "arcMainnet",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arcscan.com/api",
          browserURL: "https://arcscan.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};