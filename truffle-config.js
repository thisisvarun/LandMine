const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: fs.readFileSync(path.resolve(__dirname, '.secret'), 'utf8').trim()
        },
        providerOrUrl: `https://sepolia.infura.io/v3/98a83f6e77274b438488553bf62ca975`,
        chainId: 11155111, // Sepolia's network ID
        gas: 4000000, // Adjust as needed
        gasPrice: 10000000000, // Adjust as needed
        confirmations: 2,
        timeoutBlocks: 200,
        skipDryRun: true
      }),
      network_id: '11155111', // Sepolia's network ID
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
