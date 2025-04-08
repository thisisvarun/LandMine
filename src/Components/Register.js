import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
import Land from '../abis/LandRegistry.json';
import { withStyles } from '@material-ui/core/styles';
import getWeb3 from '../utils/getWeb3';

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
  state = {
    name: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    contact: '',
    account: '',
    landList: null,
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];
      window.localStorage.setItem('web3account', account);
      this.setState({ account });

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Land.networks[networkId];

      if (!deployedNetwork) {
        alert('Smart contract not deployed to detected network.');
        return;
      }

      const landList = new web3.eth.Contract(Land.abi, deployedNetwork.address);
      this.setState({ landList });

      if (window.localStorage.getItem('authenticated') === 'true') {
        window.location = '/dashboard';
      }
    } catch (error) {
      console.error('Error initializing web3', error);
      alert('Failed to connect to MetaMask. Check console.');
    }
  };

  handleChange = (field) => (event) => {
    this.setState({ [field]: event.target.value });
  };

  validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  login = async ({ privateKey, name, contact, email, postalCode, city }) => {
    const { landList, account } = this.state;

    try {
      await landList.methods
        .addUser(privateKey, name, contact, email, postalCode, city)
        .send({ from: account, gas: 1000000 })
        .on('receipt', () => {
          alert('User registered successfully!');
          window.location = '/login';
        });
    } catch (err) {
      console.error('Smart contract error:', err);
      alert('Blockchain registration failed.');
    }
  };

  handleSubmit = async () => {
    const { name, email, contact, address, city, postalCode } = this.state;

    if (!name || !email || !contact || !address || !city || !postalCode) {
      alert('All fields are required.');
      return;
    }

    if (!this.validateEmail(email)) {
      alert('Enter a valid email address.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/signup', {
        name,
        email,
        contact,
        accountAddress: address,
        city,
        postalCode,
      });

      if (response.data.success) {
        alert('Signup API call successful!');
        this.login({
          privateKey: address,
          name,
          contact,
          email,
          postalCode,
          city,
        });
      } else {
        alert(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('API error:', error);
      alert('API signup failed.');
    }
  };

  render() {
    const { classes } = this.props;
    const { name, email, contact, address, city, postalCode } = this.state;

    return (
      <div className="profile-bg">
        <Container className={classes.root}>
          <div className="register-text">Register Here</div>
          <div className="input">
            <TextField label="Name" fullWidth value={name} margin="normal" onChange={this.handleChange('name')} />
            <TextField label="Email" fullWidth value={email} margin="normal" onChange={this.handleChange('email')} />
            <TextField label="Contact" fullWidth value={contact} margin="normal" onChange={this.handleChange('contact')} />
            <TextField label="Ethereum Address" fullWidth value={address} margin="normal" onChange={this.handleChange('address')} />
            <TextField label="City" fullWidth value={city} margin="normal" onChange={this.handleChange('city')} />
            <TextField label="Postal Code" fullWidth value={postalCode} margin="normal" onChange={this.handleChange('postalCode')} />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={this.handleSubmit}>
              Sign Up
            </Button>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#328888' }}>
              Login here
            </a>
          </div>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(Register);
