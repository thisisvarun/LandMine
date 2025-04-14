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
      const apiUrl = 'http://localhost:5000';
      console.log('Attempting to login to:', `${apiUrl}/login`);
  
      // Validate inputs before sending
      if (!identifier || !password) {
        throw new Error('Please provide both email/username and password');
      }
  
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          [loginType === 'government' ? 'username' : 'email']: identifier,
          password,
          isGovernment: loginType === 'government',
          ...(account && { walletAddress: account })
        })
      });
  
      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
      }
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Login failed with status ${response.status}`);
      }
  
      // Successful login handling
      console.log('Login successful:', data);
      toast.success('Login successful!');
      
      // Update auth context with user data
      setAuthState({
        isAuthenticated: true,
        user: {
          ...data.user,
          role: loginType === 'government' ? 'government' : 'user'
        },
        token: data.token
      });
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      // Redirect to appropriate dashboard
      if (loginType === 'government') {
        navigate('/government-dashboard');
      } else {
        navigate('/user-dashboard');
      }
  
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please:';
        errorMessage += '\n1. Check if backend is running';
        errorMessage += '\n2. Verify no firewall blocking port 5000';
        errorMessage += '\n3. Try refreshing the page';
      }
  
      toast.error(errorMessage);
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