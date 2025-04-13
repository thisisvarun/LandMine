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

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    privateKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (formData.password.length < 8) newErrors.password = 'Password too short';
    if (!/^0x[a-fA-F0-9]{64}$/.test(formData.privateKey)) newErrors.privateKey = 'Invalid private key format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      toast.success('Account created successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
      console.error('Signup error:', err);
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
      paddingTop: 5
    }}>
      
      <Typography variant="h4" gutterBottom>Demo Registration</Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>Development Only:</strong> Use Hardhat test private keys
      </Alert>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Username"
          error={!!errors.username}
          helperText={errors.username}
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Email"
          type="email"
          error={!!errors.email}
          helperText={errors.email}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          error={!!errors.password}
          helperText={errors.password || 'Minimum 8 characters'}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          label="Hardhat Private Key"
          error={!!errors.privateKey}
          helperText={errors.privateKey || 'Should start with 0x followed by 64 hex characters'}
          value={formData.privateKey}
          onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </Button>
      </Box>
    </Container>
  );
};

export default Signup;