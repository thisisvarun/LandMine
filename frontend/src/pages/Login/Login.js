import React, { useState, useContext } from 'react';
import { TextField, Button, Container, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../providers/AuthProvider';
import { Web3Context } from '../../providers/Web3Provider';
import './Login.css'; // Extracted styles to CSS file

const Login = () => {
  const [isGovtLogin, setIsGovtLogin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const { account } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleLoginTypeChange = () => {
    setIsGovtLogin(!isGovtLogin);
    setIdentifier('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!identifier || !password) {
      toast.error('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [isGovtLogin ? 'username' : 'email']: identifier,
          password,
          isGovernment: isGovtLogin,
          walletAddress: account
        }),
        credentials: 'include' // For httpOnly cookies if using them
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Update global auth state
      setAuthState({
        isAuthenticated: true,
        isGovt: isGovtLogin,
        isLoading: false
      });

      // Navigate based on role
      navigate(isGovtLogin ? '/dashboard_govt' : '/dashboard');
      
      toast.success(`Welcome ${data.user?.username || ''}`);

    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container className="login-form">
        <h2 className="login-title">Login</h2>

        <div className="login-toggle">
          <Button
            variant={!isGovtLogin ? 'contained' : 'outlined'}
            color="primary"
            onClick={handleLoginTypeChange}
          >
            User Login
          </Button>
          <Button
            variant={isGovtLogin ? 'contained' : 'outlined'}
            color="primary"
            onClick={handleLoginTypeChange}
            className="govt-login-btn"
          >
            Government Login
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <TextField
            label={isGovtLogin ? 'Username' : 'Email'}
            fullWidth
            value={identifier}
            margin="normal"
            onChange={(e) => setIdentifier(e.target.value)}
            variant="outlined"
            className="login-input"
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            margin="normal"
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            className="login-input"
          />

          <div className="login-submit">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
          </div>
        </form>

        {!isGovtLogin && (
          <div className="login-signup-link">
            Don't have an account?{' '}
            <a href="/signup" className="signup-link">
              Sign Up
            </a>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Login;