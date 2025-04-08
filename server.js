import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Web3 from 'web3';
import Land from './src/abis/LandRegistry.json' assert { type: 'json' };

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

let landContract;
const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = Land.networks[networkId];
  landContract = new web3.eth.Contract(Land.abi, deployedNetwork.address);
};
await initContract();

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
    console.error('Contract interaction failed:', error);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
