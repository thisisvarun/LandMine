import React, { useState, useEffect } from 'react';
import { TextField, Button, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import axios from 'axios';

const styles = {
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
};

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedAddress, setGeneratedAddress] = useState('');
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Using useNavigate for navigation

  useEffect(() => {
    const initializeWeb3 = async () => {
      const web3Instance = new Web3(Web3.givenProvider || 'http://localhost:8545');
      const accounts = await web3Instance.eth.getAccounts();
      setWeb3(web3Instance);
      setAccount(accounts[0] || '');
    };

    initializeWeb3();
  }, []);

  const generateAddress = () => {
    const newAccount = web3.eth.accounts.create();
    setGeneratedAddress(newAccount.address);
    return newAccount.address;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(generatedAddress);
    alert('Address copied to clipboard!');
  };

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      return setErrorMessage('Username, Email, and Password are required.');
    }

    try {
      const generatedAddress = generateAddress();

      const response = await axios.post('http://localhost:5000/signup', {
        username,
        email,
        password,
        accountAddress: generatedAddress,
      });

      if (response.data.success) {
        setSuccessMessage('Registration successful!');
        window.localStorage.setItem('userAddress', generatedAddress);
        navigate('/login'); // Using navigate for redirection
      } else {
        setErrorMessage(response.data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage('Server error during signup.');
    }
  };

  return (
    <div className="profile-bg">
      <Container style={{ marginTop: '40px' }} sx={styles.root}>
        <div className="register-text">Register Here</div>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
            {generatedAddress && (
              <div style={{ marginTop: '10px', wordBreak: 'break-word' }}>
                Your Address: {generatedAddress}
                <Button
                  onClick={copyAddress}
                  size="small"
                  startIcon={<FileCopyIcon />}
                  style={{ marginLeft: '10px', color: '#fff' }}
                >
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
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleSubmit}>
            Sign Up
          </Button>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
          Already have an account? <a href="/login" style={{ color: '#328888' }}>Login here</a>
        </div>
      </Container>
    </div>
  );
};

export default Register;
