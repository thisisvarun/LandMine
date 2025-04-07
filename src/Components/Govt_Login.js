import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Container } from '@material-ui/core';
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
    '&  .MuiInputBase-root': {
      color: '#fff',
    },
    '&  .MuiInput-underline:before': {
      borderBottomColor: '#fff',
    },
    '&  .MuiInput-underline:after': {
      borderBottomColor: '#fff',
    },
    '&  .MuiInput-underline:hover': {
      borderBottomColor: '#fff',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#328888',
      fontFamily: "'Roboto Condensed', sans-serif",
    },
  },
});

class GovtLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      error: ''
    };
  }

  componentDidMount = () => {
    if (window.localStorage.getItem('govtAuthenticated') === 'true') {
      this.props.history.push('/dashboard_govt');
    }
  };

  handleChange = (name) => (event) => {
    this.setState({ 
      [name]: event.target.value,
      error: ''
    });
  };

  handleSubmit = async () => {
    const { username, password } = this.state;

    this.setState({ loading: true });

    try {
      if (username === "admin" && password === "admin123") {
        // Set government authentication in localStorage
        window.localStorage.setItem('govtAuthenticated', 'true');
        this.props.history.push('/dashboard_govt'); // Redirect to government dashboard
      } else {
        alert("Invalid credentials. Try admin/admin123 for demo.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed.");
    } finally {
      this.setState({ loading: false });
    }
  };


  render() {
    const { classes } = this.props;
    const { username, password, loading, error } = this.state;

    return (
      <div className="profile-bg">
        <Container className={classes.root}>
          <div className="login-text">Government Portal</div>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
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
        </Container>
      </div>
    );
  }
}

export default withStyles(styles)(GovtLogin);
