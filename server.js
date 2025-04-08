import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Web3 from 'web3';
import Land from './src/abis/LandRegistry.json' assert { type: 'json' };

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Web3
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// Initialize Contract
let landContract;
const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = Land.networks[networkId];
  if (deployedNetwork) {
    landContract = new web3.eth.Contract(Land.abi, deployedNetwork.address);
  } else {
    console.error('Smart contract not deployed on the detected network.');
  }
};
await initContract();

// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, contact, accountAddress, city, postalCode } = req.body;

  if (!name || !email || !contact || !accountAddress || !city || !postalCode) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const accounts = await web3.eth.getAccounts();
    await landContract.methods
      .addUser(accountAddress, name, contact, email, postalCode, city)
      .send({ from: accounts[0], gas: 1000000 });

    res.json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error interacting with smart contract:', error);
    res.status(500).json({ success: false, message: 'Failed to register user.' });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
