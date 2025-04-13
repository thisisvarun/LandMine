import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography,
  Alert,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    privateKey: '' // For manual Hardhat private key input
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch(`http://localhost:5000/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          privateKey: formData.privateKey
        })
      });
  
      // First check the response status
      if (!response.ok) {
        const text = await response.text(); // Get raw response first
        console.error('Raw error response:', text);
        try {
          // Try to parse as JSON
          const json = JSON.parse(text);
          throw new Error(json.message || 'Signup failed');
        } catch {
          // If not JSON, use raw text
          throw new Error(text || 'Signup failed');
        }
      }
  
      const data = await response.json();
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Container maxWidth="sm" className="signup-form">
        <Typography variant="h4" gutterBottom>
          Demo Registration
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Development Only:</strong> Paste Hardhat private keys from your test environment.
          Never use real private keys!
        </Alert>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Hardhat Private Key"
            value={formData.privateKey}
            onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
            placeholder="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            helperText="Paste from your Hardhat console output"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Creating Demo Account...' : 'Register'}
          </Button>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Hardhat Test Keys Example:</strong>
          </Typography>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
            <div>Account #0: 0xac0974...f2ff80</div>
            <div>Account #1: 0x59c699...8690d</div>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Signup;