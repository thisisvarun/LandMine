require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      provider: () =>
        new HDWalletProvider(
          process.env.PRIVATE_KEY,
          'http://127.0.0.1:7545',
          0, // Index of the account to use, typically 0 for the first account
        ),
      network_id: 5777,  // Ganache network ID
      gas: 6721975,       // Default gas limit in Ganache
      gasPrice: 20000000000, // Gas price (adjust based on your requirements)
    },
  },
  compilers: {
    solc: {
      version: "0.8.25", // Ensure the Solidity version matches your code
    },
  },
};
