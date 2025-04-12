require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC, // From your .env file
          process.env.QUICKNODE_RPC // Your QuickNode Sepolia HTTP URL
        ),
      network_id: 11155111, // Sepolia network ID
      gas: 5000000,
      gasPrice: 10000000000,
      confirmations: 2,
      networkCheckTimeout: 100000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.25",
    },
  },
};
