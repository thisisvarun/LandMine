import React, { useState, useEffect } from 'react';
import { 
  Container,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Grid,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';
import { useNavigate } from 'react-router-dom';

const AddNewLand = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pan: '',
    occupation: '',
    state: '',
    address: '',
    postalCode: '',
    city: '',
    contact: '',
    laddress: '',
    lstate: '',
    lcity: '',
    lamount: '',
    larea: '',
    lpostalCode: ''
  });
  const [checked, setChecked] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);

          const landContract = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            LandRegistry.abi,
            signer
          );
          setContract(landContract);

          // Check authentication
          if (!localStorage.getItem('authenticated')) {
            navigate('/login');
          }
        } catch (error) {
          console.error("Initialization error:", error);
        }
      } else {
        alert("Please install MetaMask or another Web3 wallet");
      }
    };

    initialize();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate property ID
      const propertyId = await contract.computeId(formData.laddress, formData.lamount);

      // Prepare land data
      const landData = {
        ...formData,
        status: 'Pending',
        message: 'Waiting for government approval'
      };

      // Call contract method
      const tx = await contract.Registration(
        account,
        JSON.stringify(landData), // In production, you'd store this on IPFS
        formData.laddress,
        formData.lamount,
        propertyId,
        'Not Approved',
        'Pending government approval',
        { gasLimit: 1000000 }
      );

      await tx.wait();
      alert('Land registration submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      alert('Error submitting land registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
        p: 4
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          textAlign: 'center',
          fontWeight: 'bold',
          mb: 4
        }}>
          Register New Land
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Owner Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner's Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PAN Number"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Land Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Land Address"
                name="laddress"
                value={formData.laddress}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="lstate"
                value={formData.lstate}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="lcity"
                value={formData.lcity}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                name="lpostalCode"
                value={formData.lpostalCode}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area (sq meters)"
                name="larea"
                type="number"
                value={formData.larea}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount (ETH)"
                name="lamount"
                type="number"
                value={formData.lamount}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  color="primary"
                />
              }
              label="I agree to the Terms and Conditions"
            />
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              disabled={!checked || loading}
              sx={{ px: 4 }}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default AddNewLand;