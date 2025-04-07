import React, { Component } from 'react';
import { TextField, Button, Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import Web3 from 'web3';

const styles = () => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormLabel-root': {
      color: '#fff',
    },
    '& .MuiInputBase-root': {
      color: '#fff',
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: '#fff',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#fff',
    },
    '& .MuiInput-underline:hover': {
      borderBottomColor: '#fff',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#328888',
      fontFamily: "'Roboto Condensed', sans-serif",
    },
  },
});

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: '',
      privateKeyError: false,
      privateKeyHelperText: '',
      loading: false,
      error: ''
    };
  }

  handleChange = (event) => {
    this.setState({ 
      privateKey: event.target.value,
      error: '' 
    });
  };

  validatePrivateKey = () => {
    const { privateKey } = this.state;
    if (!privateKey) {
      this.setState({
        privateKeyError: true,
        privateKeyHelperText: 'Private key is required.',
      });
      return false;
    }
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      this.setState({
        privateKeyError: true,
        privateKeyHelperText: 'Invalid private key format.',
      });
      return false;
    }
    this.setState({
      privateKeyError: false,
      privateKeyHelperText: '',
    });
    return true;
  };

  handleSubmit = async () => {
    if (!this.validatePrivateKey()) return;

    this.setState({ loading: true, error: '' });

    try {
      // Check if Web3 is available
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          window.web3 = new Web3(window.ethereum);
        } catch (error) {
          this.setState({ 
            error: 'User denied account access',
            loading: false 
          });
          return;
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        this.setState({ 
          error: 'No Web3 provider detected. Install MetaMask!',
          loading: false 
        });
        return;
      }

      const { privateKey } = this.state;
      const data = { privateKey };

      const response = await axios.post('http://localhost:4000/privatekeylogin', data);
      
      if (response.data.success) {
        window.localStorage.setItem('authenticated', 'true');
        window.localStorage.setItem('id', response.data.user._id);
        window.localStorage.setItem('account', response.data.account);
        window.location = '/dashboard';
      } else {
        this.setState({ 
          error: response.data.message || 'Authentication failed',
          loading: false 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      this.setState({ 
        error: error.response?.data?.message || 'An error occurred during login',
        loading: false 
      });
    }
  };

  render() {
    const { classes } = this.props;
    const { privateKey, privateKeyError, privateKeyHelperText, loading, error } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="login-text">User Login</div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <div className="input">
            <TextField
              id="private-key-input"
              type="password"
              label="Private Key"
              placeholder="Enter Your Private Key (0x...)"
              fullWidth
              value={privateKey}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={this.handleChange}
              error={privateKeyError}
              helperText={privateKeyHelperText}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon>submit</SendIcon>}
              onClick={this.handleSubmit}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
            Don't have an account?{' '}
            <a href="/signup" style={{ color: '#328888' }}>
              Sign Up
            </a>
          </div>
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(Login);