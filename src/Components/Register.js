import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
import Web3 from 'web3';
import Land from '../abis/LandRegistry.json';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormLabel-root': { color: '#fff' },
    '& .MuiInputBase-root': { color: '#fff' },
    '& .MuiInput-underline:before': { borderBottomColor: '#fff' },
    '& .MuiInput-underline:after': { borderBottomColor: '#fff' },
    '& .MuiInput-underline:hover': { borderBottomColor: '#fff' },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#328888',
      fontFamily: "'Roboto Condensed', sans-serif",
    },
  },
});

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      accountAddress: '',
      postalCode: '',
      city: '',
      contact: '',
      account: '',
      web3: null,
      landList: null,
    };
  }

  componentDidMount = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Land.networks[networkId];

      if (deployedNetwork) {
        const landList = new web3.eth.Contract(Land.abi, deployedNetwork.address);
        this.setState({
          web3,
          landList,
          account: accounts[0],
          accountAddress: accounts[0],
        });
      } else {
        alert('Smart contract not deployed on detected network.');
      }
    } else {
      alert('Please install MetaMask.');
    }

    if (window.localStorage.getItem('authenticated') === 'true') {
      window.location = '/dashboard';
    }
  };

  handleChange = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  handleSubmit = async () => {
    const { name, email, contact, accountAddress, city, postalCode } = this.state;

    if (!name || !email || !contact || !accountAddress || !city || !postalCode) {
      return alert('All fields are required.');
    }

    if (!this.validateEmail(email)) {
      return alert('Invalid email address.');
    }

    try {
      const response = await axios.post('http://localhost:4000/signup', {
        name,
        email,
        contact,
        accountAddress,
        city,
        postalCode,
      });

      if (response.data.success) {
        this.registerOnBlockchain();
      } else {
        alert(response.data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Server error during signup.');
    }
  };

  registerOnBlockchain = async () => {
    const { landList, account, name, email, contact, city, postalCode, accountAddress } = this.state;

    try {
      await landList.methods
        .addUser(accountAddress, name, contact, email, postalCode, city)
        .send({ from: account, gas: 1000000 });

      alert('Registration successful!');
      window.location = '/login';
    } catch (error) {
      console.error('Blockchain error:', error);
      alert('Blockchain registration failed.');
    }
  };

  render() {
    const { classes } = this.props;
    const { name, email, contact, accountAddress, city, postalCode } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="register-text">Register Here</div>
          <div className="input">
            <TextField label="Name" fullWidth margin="normal" value={name} onChange={this.handleChange('name')} />
            <TextField label="Email Address" fullWidth margin="normal" value={email} onChange={this.handleChange('email')} />
            <TextField label="Contact Number" fullWidth margin="normal" value={contact} onChange={this.handleChange('contact')} />
            <TextField label="Ethereum Address" fullWidth margin="normal" value={accountAddress} onChange={this.handleChange('accountAddress')} />
            <TextField label="City" fullWidth margin="normal" value={city} onChange={this.handleChange('city')} />
            <TextField label="Postal Code" fullWidth margin="normal" value={postalCode} onChange={this.handleChange('postalCode')} />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={this.handleSubmit}>
              Sign Up
            </Button>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
            Already have an account? <a href="/login" style={{ color: '#328888' }}>Login here</a>
          </div>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(Register);
