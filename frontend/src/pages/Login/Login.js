import React, { useState } from 'react';
import { TextField, Button, Container } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

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

const CombinedLogin = () => {
  const [isGovtLogin, setIsGovtLogin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Using useNavigate for navigation

  const handleLoginTypeChange = (event) => {
    setIsGovtLogin(event.target.value === 'govt');
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!identifier || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    const payload = isGovtLogin
      ? { username: identifier, password, isGovt: true }
      : { email: identifier, password, isGovt: false };

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (data.role === 'government') {
          localStorage.setItem('govtAuthenticated', 'true');
          navigate('/dashboard_govt'); // Using navigate instead of history.push
        } else {
          localStorage.setItem('authenticated', 'true');
          localStorage.setItem('userEmail', data.email);
          navigate('/dashboard'); // Using navigate instead of history.push
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error');
    }

    setLoading(false);
  };

  return (
    <div className="profile-bg">
      <Container style={{ marginTop: '40px' }} sx={styles.root}>
        <div className="login-text">Login</div>

        <div style={{ marginBottom: '20px' }}>
          <Button
            variant={isGovtLogin ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => setIsGovtLogin(false)}
          >
            User Login
          </Button>
          <Button
            variant={!isGovtLogin ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => setIsGovtLogin(true)}
            style={{ marginLeft: '10px' }}
          >
            Government Login
          </Button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <TextField
          label={isGovtLogin ? 'Username' : 'Email'}
          fullWidth
          value={identifier}
          margin="normal"
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSubmit}
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
};

export default CombinedLogin;
