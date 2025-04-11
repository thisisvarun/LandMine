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

class CombinedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGovtLogin: false, // Tracks whether it's government login or not
      email: '',
      password: '',
      username: '',
      privateKey: '',
      privateKeyError: false,
      privateKeyHelperText: '',
      loading: false,
      error: '',
    };
  }

  handleLoginTypeChange = (event) => {
    this.setState({ isGovtLogin: event.target.value === 'govt' });
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
      error: '',
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
    const { isGovtLogin, username, password, email, privateKey } = this.state;
    this.setState({ loading: true });

    if (isGovtLogin) {
      // Govt login logic
      if (username === 'admin' && password === 'admin123') {
        window.localStorage.setItem('govtAuthenticated', 'true');
        this.props.history.push('/dashboard_govt'); // Redirect to government dashboard
      } else {
        alert('Invalid credentials. Try admin/admin123 for demo.');
      }
    } else {
      // User login logic for Trust Wallet
      if (!this.validatePrivateKey()) return;

      if (!window.ethereum) {
        alert('Please install Trust Wallet!');
        return;
      }

      try {
        // Request user's account from Trust Wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        // Store login data
        window.localStorage.setItem('authenticated', 'true');
        window.localStorage.setItem('account', account);
        window.localStorage.setItem('email', email); // Store email for general users

        // Redirect to user dashboard
        this.props.history.push('/dashboard'); // Redirect to user dashboard
      } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed. Check console for details.');
      }
    }

    this.setState({ loading: false });
  };

  render() {
    const { classes } = this.props;
    const { isGovtLogin, privateKey, username, password, email, privateKeyError, privateKeyHelperText, loading, error } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="login-text">Login</div>

          {/* Toggle between User Login and Govt Login */}
          <div style={{ marginBottom: '20px' }}>
            <Button
              variant={isGovtLogin ? 'outlined' : 'contained'}
              color="primary"
              onClick={() => this.setState({ isGovtLogin: false })}
            >
              User Login
            </Button>
            <Button
              variant={!isGovtLogin ? 'outlined' : 'contained'}
              color="primary"
              onClick={() => this.setState({ isGovtLogin: true })}
              style={{ marginLeft: '10px' }}
            >
              Government Login
            </Button>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          {isGovtLogin ? (
            <>
              <TextField
                label="Username"
                fullWidth
                value={username}
                margin="normal"
                onChange={this.handleChange('username')}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                margin="normal"
                onChange={this.handleChange('password')}
              />
            </>
          ) : (
            <>
              <TextField
                label="Email"
                fullWidth
                value={email}
                margin="normal"
                onChange={this.handleChange('email')}
              />
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
                onChange={this.handleChange('privateKey')}
                error={privateKeyError}
                helperText={privateKeyHelperText}
              />
            </>
          )}

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

          {!isGovtLogin && (
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
              Don't have an account?{' '}
              <a href="/signup" style={{ color: '#328888' }}>
                Sign Up
              </a>
            </div>
          )}
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(CombinedLogin);
