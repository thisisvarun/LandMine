import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  List,
  ListItem
} from '@mui/material';
import { ethers } from 'ethers';

const Header = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isGovt, setIsGovt] = useState(false);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('authenticated') === 'true';
      const govt = localStorage.getItem('govtAuthenticated') === 'true';
      setAuthenticated(auth);
      setIsGovt(govt);
    };

    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkAuth();
    checkWalletConnection();

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
      if (!accounts[0]) {
        localStorage.removeItem('authenticated');
        localStorage.removeItem('govtAuthenticated');
        setAuthenticated(false);
        setIsGovt(false);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        localStorage.setItem('web3account', address);
        
        // For demo purposes - in production, you'd verify actual roles
        const isGovernmentUser = address === process.env.REACT_APP_GOVT_ADDRESS;
        
        if (isGovernmentUser) {
          localStorage.setItem('govtAuthenticated', 'true');
          setIsGovt(true);
          navigate('/dashboard_govt');
        } else {
          localStorage.setItem('authenticated', 'true');
          setAuthenticated(true);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('govtAuthenticated');
    localStorage.removeItem('web3account');
    setAuthenticated(false);
    setIsGovt(false);
    setAccount(null);
    navigate('/');
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: 'primary.dark',
      boxShadow: 3,
      zIndex: (theme) => theme.zIndex.drawer + 1
    }}>
      <Toolbar sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              color: 'common.white',
              textDecoration: 'none',
              mr: 4,
              fontWeight: 'bold'
            }}
          >
            Land Registry
          </Typography>

          <List sx={{ display: 'flex', p: 0 }}>
            {!authenticated && !isGovt && (
              <>
                <ListItem sx={{ width: 'auto' }}>
                  <Button 
                    component={Link} 
                    to="/login" 
                    sx={{ 
                      color: 'common.white',
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Login
                  </Button>
                </ListItem>
                <ListItem sx={{ width: 'auto' }}>
                  <Button 
                    component={Link} 
                    to="/signup" 
                    sx={{ 
                      color: 'common.white',
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Sign Up
                  </Button>
                </ListItem>
              </>
            )}

            {authenticated && (
              <>
                <ListItem sx={{ width: 'auto' }}>
                  <Button 
                    component={Link} 
                    to="/dashboard" 
                    sx={{ 
                      color: 'common.white',
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Dashboard
                  </Button>
                </ListItem>
                <ListItem sx={{ width: 'auto' }}>
                  <Button 
                    component={Link} 
                    to="/profile" 
                    sx={{ 
                      color: 'common.white',
                      '&:hover': { color: 'secondary.main' }
                    }}
                  >
                    Profile
                  </Button>
                </ListItem>
              </>
            )}

            {isGovt && (
              <ListItem sx={{ width: 'auto' }}>
                <Button 
                  component={Link} 
                  to="/dashboard_govt" 
                  sx={{ 
                    color: 'common.white',
                    '&:hover': { color: 'secondary.main' }
                  }}
                >
                  Govt Dashboard
                </Button>
              </ListItem>
            )}

            <ListItem sx={{ width: 'auto' }}>
              <Button 
                component={Link} 
                to="/guide" 
                sx={{ 
                  color: 'common.white',
                  '&:hover': { color: 'secondary.main' }
                }}
              >
                FAQ
              </Button>
            </ListItem>
          </List>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {account && (
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2,
                fontFamily: 'monospace',
                color: 'common.white',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {`${account.substring(0, 6)}...${account.substring(38)}`}
            </Typography>
          )}

          {!authenticated && !isGovt ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={connectWallet}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{
                color: 'common.white',
                borderColor: 'common.white',
                '&:hover': {
                  backgroundColor: 'error.main',
                  borderColor: 'error.main'
                },
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;