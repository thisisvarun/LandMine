import Web3 from 'web3';

const getWeb3 = async () => {
  try {
    const provider = new Web3.providers.HttpProvider(process.env.QUICKNODE_RPC); // Use Sepolia RPC
    const web3 = new Web3(provider);
    return web3;
  } catch (error) {
    console.error('Failed to load Web3:', error);
    throw error;
  }
};

export default getWeb3;