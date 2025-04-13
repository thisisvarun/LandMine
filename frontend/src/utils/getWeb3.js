import Web3 from 'web3';

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        resolve(web3);
      }
      // Fallback to QuickNode's Sepolia RPC
      else {
        const provider = new Web3.providers.HttpProvider(process.env.QUICKNODE_RPC);
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using QuickNode RPC.');
        resolve(web3);
      }
    });
  });

export default getWeb3;
