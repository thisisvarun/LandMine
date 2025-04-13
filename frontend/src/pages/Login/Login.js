import React, { useState, useContext } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
  Box,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../providers/AuthProvider';
import { Web3Context } from '../../providers/Web3Provider';

const Login = () => {
  const [loginType, setLoginType] = useState('user'); // 'user' or 'government'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const { account } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleLoginTypeChange = (event, newType) => {
    if (newType !== null) {
      setLoginType(newType);
      setIdentifier('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Attempting to connect to:', apiUrl);
  
      // First test basic connection
      const healthCheck = await fetch(`${apiUrl}/health`);
      if (!healthCheck.ok) throw new Error('Backend not responding');
  
      // Proceed with login
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [loginType === 'government' ? 'username' : 'email']: identifier,
          password,
          isGovernment: loginType === 'government',
          walletAddress: account
        })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
  
      // Successful login handling...
      
    } catch (err) {
      console.error('Connection error:', err);
      toast.error(
        err.message.includes('Failed to fetch')
          ? 'Backend server unavailable. Please: 1) Check backend is running, 2) Verify port 5000 is open, 3) Ensure no CORS issues'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="sm" sx={{ 
      mt: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 10
    }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        {loginType === 'government' ? 'Government Portal' : 'User Login'}
      </Typography>

      <Alert severity="info" sx={{ width: '100%', mb: 3 }}>
        {loginType === 'government' 
          ? 'Government officials login here' 
          : 'Please login with your registered email'}
      </Alert>

      <Box sx={{ width: '100%', mb: 3 }}>
        <ToggleButtonGroup
          value={loginType}
          exclusive
          onChange={handleLoginTypeChange}
          fullWidth
        >
          <ToggleButton value="user" sx={{ py: 1.5 }}>
            User Login
          </ToggleButton>
          <ToggleButton value="government" sx={{ py: 1.5 }}>
            Government Login
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        sx={{ 
          width: '100%',
          mt: 1,
          '& .MuiTextField-root': { mb: 2 }
        }}
      >
        <TextField
          label={loginType === 'government' ? 'Username' : 'Email'}
          variant="outlined"
          fullWidth
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
          disabled={loading}
          sx={{ mt: 1, py: 1.5 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>

      {loginType === 'user' && (
        <Typography variant="body2" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Button 
            href="/signup" 
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Sign up here
          </Button>
        </Typography>
      )}
    </Container>
  );
};

export default Login;