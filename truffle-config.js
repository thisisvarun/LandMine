// Load environment variables from .env file
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC, // Fetch the mnemonic from .env file
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}` // Ensure you have the correct Infura project ID
      ),
      network_id: 11155111, // Sepolia network ID
      gas: 4465030, // Gas limit
      gasPrice: 10000000000, // Gas price
      networkCheckTimeout: 100000, // Increase timeout if network is slow
    },
    // You can add more network configurations here
  },
  compilers: {
    solc: {
      version: "0.8.0", // or your preferred version
    },
  },
};
