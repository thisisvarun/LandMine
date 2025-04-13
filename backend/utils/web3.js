const { Web3 } = require('web3');

let web3;

const connectWeb3 = () => {
  if (!web3) {
    web3 = new Web3(process.env.WEB3_PROVIDER || 'http://localhost:8545');
  }
  return web3;
};

const getContract = (abi, address) => {
  const web3Instance = connectWeb3();
  return new web3Instance.eth.Contract(abi, address);
};

module.exports = {
  connectWeb3,
  getContract
};