import React, { Component } from 'react';
import { TextField, Button, Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import { withStyles } from '@material-ui/core/styles';

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

    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Store login data
      window.localStorage.setItem('authenticated', 'true');
      window.localStorage.setItem('account', account);

      // Redirect to dashboard
      window.location = '/dashboard'; // Or wherever you want to redirect after successful login
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check console for details.");
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
              endIcon={<SendIcon />}
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
