import React, { Component } from 'react';
import { TextField, Button, Container, Checkbox, FormControlLabel } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Land from '../../abis/LandRegistry.json';
import axios from 'axios';
import { create } from 'ipfs-http-client'; 
import Web3 from 'web3';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });  // Initialize IPFS client

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      pan: '',
      occupation: '',
      state: '',
      address: '',
      postalCode: '',
      city: '',
      contact: '',
      laddress: '',
      lstate: '',
      lcity: '',
      lamount: '',
      larea: '',
      lpostalCode: '',
      ipfsHash: '',
      checked: false,
      buffer: null,
      images: [],
      image: [],
      account: null,
      landList: null,
      propertyId: null,
    };
  }

  componentDidMount = async () => {
    const web3 = new Web3(
      Web3.givenProvider || process.env.QUICKNODE_RPC // Use Sepolia RPC
    );
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({ account: accounts[0] });
        window.ethereum.on('accountsChanged', (accounts) => {
          this.setState({ account: accounts[0] });
        });
      } catch (error) {
        window.alert('Please connect your Trust Wallet');
      }
    } else {
      window.alert('Please install Trust Wallet');
    }

    const networkId = await web3.eth.net.getId();
    const LandData = Land.networks[networkId];
    if (LandData) {
      const landList = new web3.eth.Contract(Land.abi, LandData.address);
      this.setState({ landList });
    } else {
      window.alert('Land contract not deployed to detected network.');
    }

    if (!window.localStorage.getItem('authenticated') || window.localStorage.getItem('authenticated') === 'false') {
      this.props.history.push('/login');
    }
  };

  validateEmail = (emailField) => {
    var reg = /^([A-Za-z0-9_])+([A-Za-z0-9_])+([A-Za-z]{2,4})$/;
    return reg.test(emailField);
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };

  handleChangeCheckbox = (event) => {
    this.setState({ checked: !this.state.checked });
  };

  async propertyID(laddress, lamount) {
    const propertyId = await this.state.landList.methods.computeId(laddress, lamount).call();
    this.setState({ propertyId });
  }

  async Register(data, account, laddress, lamount) {
    var buf = Buffer.from(JSON.stringify(data));
    const result = await ipfs.add(buf);
    ipfs.files.add(buf, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }

      this.state.landList.methods
        .Registration(
          account,
          result[0].hash,
          laddress,
          lamount,
          this.state.propertyId,
          'Not Approved',
          'Not yet approved by the govt.',
        )
        .send({
          from: this.state.account,
          gas: 1000000,
        })
        .on('receipt', function (receipt) {
          if (!receipt) {
            console.log('Transaction Failed!!!');
          } else {
            console.log('Transaction successful');
            window.alert('Transaction successful');
            window.location = '/dashboard';
          }
        });
      this.setState({ ipfsHash: result[0].hash });
    });
  }

  handleSubmit = async () => {
    const account = this.state.account;
    const laddress = this.state.laddress;
    const lamount = this.state.lamount;

    let data = {
      name: this.state.name,
      email: this.state.email,
      contact: this.state.contact,
      pan: this.state.pan,
      address: this.state.address,
      state: this.state.state,
      city: this.state.city,
      postalCode: this.state.postalCode,
      occupation: this.state.occupation,
      laddress: this.state.laddress,
      lstate: this.state.lstate,
      lcity: this.state.lcity,
      lpostalCode: this.state.lpostalCode,
      larea: this.state.larea,
      document: this.state.buffer,
      images: this.state.image,
      lamount: this.state.lamount,
    };

    if (data) {
      try {
        const res = await axios.post('http://localhost:4000/owner', data);
        this.propertyID(laddress, lamount);
        this.Register(data, account, laddress, lamount);
      } catch (error) {
        console.log('error:', error);
      }
    } else {
      window.alert('All fields are required.');
    }
  };

  onChange = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append('testImage', file);

    const res = await axios.post('http://localhost:4000/images', data);
    console.log(res);
  };

  fileSelectedHandler = async (e) => {
    const data = new FormData();
    data.append('testImage', e.target.files[0]);

    const res = await axios.post('http://localhost:4000/images', data);
    console.log(res);
    if (res.status === 200) {
      const img = await axios.get('http://localhost:4000/images');
      console.log(img);
    }
  };

  render() {
    return (
      <Container style={{ marginTop: '30px' }}>
        <h1 style={{ textAlign: 'center', fontWeight: '600' }}>Owner's Details</h1>
        <div className="input">
          <TextField
            id="standard-full-width"
            type="name"
            label="Owner's Name"
            placeholder="Enter Owner's Name"
            fullWidth
            value={this.state.name}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('name')}
          />
          <TextField
            id="standard-full-width"
            type="account"
            label="Private Key"
            fullWidth
            value={this.state.account}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled
          />
          <TextField
            id="standard-full-width"
            type="email"
            label="Owner's Email ID"
            placeholder="Enter Owner's Email ID"
            fullWidth
            value={this.state.email}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('email')}
          />
          <TextField
            id="standard-full-width"
            type="contact"
            label="Owner's Contact Number"
            placeholder="Enter Owner's Contact Number"
            fullWidth
            value={this.state.contact}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('contact')}
          />
          <TextField
            id="standard-full-width"
            type="pan"
            label="PAN Number"
            placeholder="Enter Owner's PAN Number"
            fullWidth
            value={this.state.pan}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('pan')}
          />
          <TextField
            id="standard-full-width"
            type="occupation"
            label="Occupation"
            placeholder="Enter Owner's Occupation"
            fullWidth
            value={this.state.occupation}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('occupation')}
          />
          <TextField
            id="standard-full-width"
            type="address"
            label="Owner's Permanent Address"
            placeholder="Enter Owner's Permanent Address"
            fullWidth
            value={this.state.address}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('address')}
          />
          <TextField
            id="standard-full-width"
            type="State"
            label="State"
            placeholder="Enter Your State"
            fullWidth
            value={this.state.state}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('state')}
          />
          <TextField
            id="standard-full-width"
            type="city"
            label="City"
            placeholder="Enter Your City"
            fullWidth
            value={this.state.city}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('city')}
          />
          <TextField
            id="standard-full-width"
            type="postalCode"
            label="Postal Code"
            placeholder="Enter Your Postal Code"
            fullWidth
            value={this.state.postalCode}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('postalCode')}
          />
        </div>

        <h1 style={{ textAlign: 'center', fontWeight: '600', marginTop: '30px' }}>Land Details</h1>
        <div className="input">
          <TextField
            id="standard-full-width"
            type="address"
            label="Address"
            placeholder="Enter Land's Identification Mark"
            fullWidth
            value={this.state.laddress}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('laddress')}
          />
          <TextField
            id="standard-full-width"
            type="State"
            label="State"
            placeholder="Enter State"
            fullWidth
            value={this.state.lstate}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('lstate')}
          />
          <TextField
            id="standard-full-width"
            type="city"
            label="City"
            placeholder="Enter City"
            fullWidth
            value={this.state.lcity}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('lcity')}
          />
          <TextField
            id="standard-full-width"
            type="postalCode"
            label="Postal Code"
            placeholder="Enter Postal Code"
            fullWidth
            value={this.state.lpostalCode}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('lpostalCode')}
          />
          <TextField
            id="standard-full-width"
            type="area"
            label="Area (in square meters)"
            placeholder="Enter Area"
            fullWidth
            value={this.state.larea}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('larea')}
          />
          <TextField
            id="standard-full-width"
            type="amount"
            label="Total Amount"
            placeholder="Enter Total Amount"
            fullWidth
            value={this.state.lamount}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={this.handleChange('lamount')}
          />
          <label htmlFor="file">Upload Legal Documents</label>
          <br />
          <input ref="file" type="file" name="user[image]" onChange={this.onChange} />
          <label htmlFor="file">Upload Pictures of Land/Plot</label>
          <br />
          <input
            ref="file"
            type="file"
            name="user[image]"
            multiple="true"
            onChange={this.fileSelectedHandler}
          />
        </div>

        <FormControlLabel
          style={{ marginTop: '20px', float: 'center' }}
          control={
            <Checkbox
              checked={this.state.checked}
              onChange={this.handleChangeCheckbox}
              name="checked"
              color="primary"
            />
          }
          label="I agree to the Terms and Conditions"
        />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {this.state.checked ? (
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={this.handleSubmit}
            >
              Submit
            </Button>
          ) : (
            <Button variant="contained" color="primary" endIcon={<SendIcon />} disabled>
              Submit
            </Button>
          )}
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          Already Registered?{' '}
          <a href="/dashboard">Check Status</a>
        </div>
      </Container>
    );
  }
}

export default Register;
