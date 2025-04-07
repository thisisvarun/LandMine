import React, { Component } from 'react';
import { TextField, Button, Container } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import axios from 'axios';
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
    };
  }

  handleChange = (event) => {
    this.setState({ privateKey: event.target.value });
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
    // Add additional validation logic if necessary
    this.setState({
      privateKeyError: false,
      privateKeyHelperText: '',
    });
    return true;
  };

  handleSubmit = async () => {
    if (!this.validatePrivateKey()) {
      return;
    }

    const { privateKey } = this.state;
    const data = { privateKey };

    try {
      const response = await axios.post('http://localhost:4000/privatekeylogin', data);
      if (response.data.result) {
        window.localStorage.setItem('authenticated', true);
        window.localStorage.setItem('id', response.data.result._id);
        window.location = '/dashboard';
      } else {
        alert('Wrong Private Key');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  render() {
    const { classes } = this.props;
    const { privateKey, privateKeyError, privateKeyHelperText } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="login-text">User Login</div>
          <div className="input">
            <TextField
              id="private-key-input"
              type="password"
              label="Private Key"
              placeholder="Enter Your Private Key"
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
            >
              Login
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
