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
      gas: 4465030,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.25",
    },
  },
};
