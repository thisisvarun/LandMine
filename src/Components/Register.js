import React, { Component } from 'react';
import { TextField, Button, Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { withStyles } from '@material-ui/core/styles';
import Web3 from 'web3';
import axios from 'axios';

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
      username: '',
      email: '',
      password: '',
      generatedAddress: '',
      account: '',
      web3: null,
      errorMessage: '',
      successMessage: '',
    };
  }

  componentDidMount = async () => {
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    this.setState({ web3, account: accounts[0] || '' });
  };

  handleChange = (field) => (e) => {
    this.setState({ [field]: e.target.value, errorMessage: '', successMessage: '' });
  };

  generateAddress = () => {
    const newAccount = this.state.web3.eth.accounts.create();
    this.setState({ generatedAddress: newAccount.address });
    return newAccount.address;
  };

  copyAddress = () => {
    navigator.clipboard.writeText(this.state.generatedAddress);
    alert('Address copied to clipboard!');
  };

  handleSubmit = async () => {
    const { username, email, password } = this.state;

    if (!username || !email || !password) {
      return this.setState({ errorMessage: 'Username, Email, and Password are required.' });
    }

    try {
      const generatedAddress = this.generateAddress();

      const response = await axios.post('http://localhost:3000/signup', {
        username,  // Send the username as part of the request
        email,
        password,
        accountAddress: generatedAddress,
      });

      if (response.data.success) {
        this.setState({ successMessage: 'Registration successful!' });
        // Optionally, store address and credentials locally or in a session
        window.localStorage.setItem('userAddress', generatedAddress);
      } else {
        this.setState({ errorMessage: response.data.message || 'Signup failed.' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      this.setState({ errorMessage: 'Server error during signup.' });
    }
  };

  render() {
    const { classes } = this.props;
    const { username, email, password, generatedAddress, errorMessage, successMessage } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="register-text">Register Here</div>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
              {generatedAddress && (
                <div style={{ marginTop: '10px', wordBreak: 'break-word' }}>
                  Your Address: {generatedAddress}
                  <Button onClick={this.copyAddress} size="small" startIcon={<FileCopyIcon />} style={{ marginLeft: '10px', color: '#fff' }}>
                    Copy
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="input">
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              value={username}
              onChange={this.handleChange('username')}
            />
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              value={email}
              onChange={this.handleChange('email')}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={this.handleChange('password')}
            />
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
