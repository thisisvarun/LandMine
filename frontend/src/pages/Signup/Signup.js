import React, { useState, useContext } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
  Alert,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../../providers/Web3Provider';
import { toast } from 'react-toastify';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    privateKey: '' // For development only
  });
  const [loading, setLoading] = useState(false);
  const { initializeWithPrivateKey } = useContext(Web3Context);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Initialize web3 with the provided private key (dev only)
      if (formData.privateKey) {
        await initializeWithPrivateKey(formData.privateKey);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          // In production, you would send walletAddress instead
          privateKey: formData.privateKey // ONLY FOR DEVELOPMENT
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Signup failed');

      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Container maxWidth="sm" className="signup-form">
        <Typography variant="h4" gutterBottom>
          Create Account
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Development Mode:</strong> Using Hardhat test accounts. 
          Never enter real private keys in development.
        </Alert>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />

          <TextField
            margin="normal"
            fullWidth
            name="privateKey"
            label="Hardhat Private Key (Dev Only)"
            value={formData.privateKey}
            onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
            helperText="Only for development with Hardhat test accounts"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Signup;