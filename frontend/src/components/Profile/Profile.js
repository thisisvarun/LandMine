import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Mail as MailIcon,
  VpnKey as VpnKeyIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';

const Profile = () => {
  const [state, setState] = useState({
    account: '',
    balance: '',
    name: '',
    email: '',
    exists: false,
    isLoading: true,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (!window.ethereum) {
          throw new Error('Please install MetaMask or another Web3 wallet');
        }

        // Connect to Hardhat local node
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Get balance
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);

        // Initialize contract
        const landList = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS,
          LandRegistry.abi,
          signer
        );

        // Get user details from contract
        const user = await landList.getUser(address);

        // Check authentication
        const auth = localStorage.getItem('authenticated');
        if (!auth || auth !== 'true') {
          navigate('/login');
          return;
        }

        setState({
          account: address,
          balance: balanceEth,
          name: user[1] || 'Not set',
          email: user[3] || 'Not set',
          exists: user[6],
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Profile load error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    loadProfileData();
  }, [navigate]);

  if (state.isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Container sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {state.error}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%)',
      py: 8
    }}>
      <Container maxWidth="md">
        <Box sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
          mt: 8
        }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                src="/static/images/avatar.png" // Replace with your avatar path
                sx={{
                  width: 200,
                  height: 200,
                  border: '4px solid',
                  borderColor: 'primary.main'
                }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  {state.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MailIcon color="primary" />
                  <Typography variant="body1">
                    {state.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKeyIcon color="primary" />
                  <Typography variant="body1" sx={{ 
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}>
                    {state.account}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon color="primary" />
                  <Typography variant="body1">
                    {parseFloat(state.balance).toFixed(4)} ETH
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;