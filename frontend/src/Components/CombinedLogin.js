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

class CombinedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isGovtLogin: false,
      email: '',
      password: '',
      loading: false,
      error: '',
    };
  }

  handleLoginTypeChange = (event) => {
    this.setState({ isGovtLogin: event.target.value === 'govt' });
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value, error: '' });
  };

  handleSubmit = async () => {
    const { isGovtLogin, email, password } = this.state;
    this.setState({ loading: true });

    if (!email || !password) {
      this.setState({ error: 'Email and Password are required.', loading: false });
      return;
    }

    if (isGovtLogin) {
      if (email === 'admin@example.com' && password === 'admin123') {
        window.localStorage.setItem('govtAuthenticated', 'true');
        this.props.history.push('/dashboard_govt');
      } else {
        alert('Invalid credentials. Try admin@example.com/admin123 for demo.');
      }
    } else {
      if (email === 'user@example.com' && password === 'user123') {
        window.localStorage.setItem('authenticated', 'true');
        window.localStorage.setItem('userEmail', email);
        this.props.history.push('/dashboard');
      } else {
        alert('Invalid user credentials.');
      }
    }

    this.setState({ loading: false });
  };

  render() {
    const { classes } = this.props;
    const { isGovtLogin, email, password, loading, error } = this.state;

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="login-text">Login</div>

          <div style={{ marginBottom: '20px' }}>
            <Button variant={isGovtLogin ? 'outlined' : 'contained'} color="primary" onClick={() => this.setState({ isGovtLogin: false })}>
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

          <TextField
            label={isGovtLogin ? 'Username' : 'Email'}
            fullWidth
            value={email}
            margin="normal"
            onChange={this.handleChange('email')}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            margin="normal"
            onChange={this.handleChange('password')}
          />

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={this.handleSubmit} disabled={loading}>
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
