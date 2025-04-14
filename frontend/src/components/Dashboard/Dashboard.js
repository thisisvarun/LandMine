import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  CircularProgress,
  AppBar,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';
import OwnerTable from '../../pages/AfterLogin/Owner_Table';
import BuyerTable from '../../pages/AfterLogin/Buyer_Table';
import RegistrationForm from '../../pages/AfterLogin/AddNewLand';
import axios from 'axios';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

// Styled components
const StyledTabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '60vh'
}));

const DashboardContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingBottom: theme.spacing(4)
}));

const UserDashboard = () => {
  const [state, setState] = useState({
    ownedAssets: [],
    availableAssets: [],
    isLoading: true,
    contract: null,
    account: null,
    error: null,
    activeTab: 0,
    txStatus: null,
    snackbarOpen: false,
    snackbarMessage: '',
    snackbarSeverity: 'success',
    dialogOpen: false,
    dialogConfig: null,
    currentPage: 0,
    rowsPerPage: 10
  });

  // Initialize connection and fetch data
  useEffect(() => {
    const initialize = async () => {
      try {
        // Connect to Ethereum
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Initialize contract
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LandRegistry.abi,
          signer
        );

        setState(prev => ({
          ...prev,
          contract,
          account: address,
          isLoading: false
        }));

        await fetchData(contract, address);
      } catch (error) {
        handleError('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // Fetch data from blockchain and backend
  const fetchData = useCallback(async (contract, account) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const [ownerProperties, allProperties, backendData] = await Promise.all([
        contract.viewAssets({ from: account }),
        contract.Assets(),
        axios.get(`${API_URL}/owner`)
      ]);

      const processedOwnedAssets = await processOwnedProperties(ownerProperties, contract);
      const processedAvailableAssets = await processAvailableProperties(allProperties, contract, account);

      setState(prev => ({
        ...prev,
        ownedAssets: [...backendData.data, ...processedOwnedAssets],
        availableAssets: processedAvailableAssets,
        isLoading: false
      }));
    } catch (error) {
      handleError('Data fetching error:', error);
    }
  }, []);

  // Process owned properties
  const processOwnedProperties = async (properties, contract) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await contract.landInfoOwner(property);
        results.push({
          id: property,
          ...details,
          // Add metadata if available
        });
      } catch (error) {
        console.error(`Error processing owned property ${property}:`, error);
      }
    }
    return results;
  };

  // Process available properties
  const processAvailableProperties = async (properties, contract, account) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await contract.landInfoOwner(property);
        
        if (details.owner.toLowerCase() !== account.toLowerCase() && details.isAvailable) {
          results.push({
            id: property,
            ...details,
            // Add metadata if available
          });
        }
      } catch (error) {
        console.error(`Error processing available property ${property}:`, error);
      }
    }
    return results;
  };

  // Handle property purchase
  const handlePurchase = (propertyId, price) => {
    setState(prev => ({
      ...prev,
      dialogOpen: true,
      dialogConfig: {
        title: 'Confirm Purchase',
        content: `Are you sure you want to purchase property ${propertyId} for ${price} ETH?`,
        actions: [
          {
            text: 'Cancel',
            handler: () => setState(prev => ({ ...prev, dialogOpen: false }))
          },
          {
            text: 'Purchase',
            handler: () => executePurchase(propertyId, price)
          }
        ]
      }
    }));
  };

  // Execute property purchase
  const executePurchase = async (propertyId, price) => {
    setState(prev => ({ ...prev, dialogOpen: false, txStatus: 'purchasing' }));
    
    try {
      const tx = await state.contract.purchaseLand(propertyId, {
        value: ethers.parseEther(price.toString())
      });
      
      showSnackbar('Purchase transaction submitted. Waiting for confirmation...', 'info');
      await tx.wait();
      
      await fetchData(state.contract, state.account);
      showSnackbar('Property purchased successfully!', 'success');
    } catch (error) {
      handleError('Purchase error:', error);
      showSnackbar('Purchase failed', 'error');
    } finally {
      setState(prev => ({ ...prev, txStatus: null }));
    }
  };

  // Handle property registration
  const handleRegister = async (landData) => {
    setState(prev => ({ ...prev, txStatus: 'registering' }));
    
    try {
      const tx = await state.contract.registerLand(
        landData.title,
        landData.description,
        ethers.parseEther(landData.price.toString()),
        landData.location,
        landData.size
      );
      
      showSnackbar('Registration submitted. Waiting for confirmation...', 'info');
      await tx.wait();
      
      await fetchData(state.contract, state.account);
      showSnackbar('Land registered successfully!', 'success');
      return true;
    } catch (error) {
      handleError('Registration error:', error);
      showSnackbar('Registration failed', 'error');
      return false;
    } finally {
      setState(prev => ({ ...prev, txStatus: null }));
    }
  };

  // Helper functions
  const handleError = (context, error) => {
    console.error(context, error);
    setState(prev => ({
      ...prev,
      error: error.message,
      isLoading: false,
      txStatus: null
    }));
  };

  const showSnackbar = (message, severity) => {
    setState(prev => ({
      ...prev,
      snackbarOpen: true,
      snackbarMessage: message,
      snackbarSeverity: severity
    }));
  };

  const handleTabChange = (event, newValue) => {
    setState(prev => ({ ...prev, activeTab: newValue }));
  };

  const handleCloseSnackbar = () => {
    setState(prev => ({ ...prev, snackbarOpen: false }));
  };

  const handlePageChange = (event, newPage) => {
    setState(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setState(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      currentPage: 0
    }));
  };

  if (state.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <DashboardContainer>
        <Alert severity="error" sx={{ my: 2 }}>
          {state.error}
        </Alert>
      </DashboardContainer>
    );
  }

  // Pagination calculations
  const paginatedOwnedAssets = state.ownedAssets.slice(
    state.currentPage * state.rowsPerPage,
    (state.currentPage + 1) * state.rowsPerPage
  );

  const paginatedAvailableAssets = state.availableAssets.slice(
    state.currentPage * state.rowsPerPage,
    (state.currentPage + 1) * state.rowsPerPage
  );

  return (
    <DashboardContainer maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 4 }}>
        Land Registry Dashboard
      </Typography>

      <AppBar position="static" color="default" sx={{ mb: 3 }}>
        <Tabs
          value={state.activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="My Properties" />
          <Tab label="Available Properties" />
          <Tab label="Register New Land" />
        </Tabs>
      </AppBar>

      <StyledTabPanel hidden={state.activeTab !== 0}>
        <OwnerTable 
          assets={paginatedOwnedAssets} 
          isLoading={state.txStatus !== null}
          currentPage={state.currentPage}
          rowsPerPage={state.rowsPerPage}
          totalItems={state.ownedAssets.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </StyledTabPanel>

      <StyledTabPanel hidden={state.activeTab !== 1}>
        <BuyerTable 
          assets={paginatedAvailableAssets}
          onPurchase={handlePurchase}
          isLoading={state.txStatus !== null}
          currentPage={state.currentPage}
          rowsPerPage={state.rowsPerPage}
          totalItems={state.availableAssets.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </StyledTabPanel>

      <StyledTabPanel hidden={state.activeTab !== 2}>
        <RegistrationForm 
          onSubmit={handleRegister}
          isLoading={state.txStatus === 'registering'}
        />
      </StyledTabPanel>

      <Snackbar
        open={state.snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={state.snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {state.snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={state.dialogOpen}
        onClose={() => setState(prev => ({ ...prev, dialogOpen: false }))}
      >
        {state.dialogConfig && (
          <>
            <DialogTitle>{state.dialogConfig.title}</DialogTitle>
            <DialogContent>
              <Typography>{state.dialogConfig.content}</Typography>
              {state.activeTab === 1 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  This action will transfer ownership and cannot be undone.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              {state.dialogConfig.actions.map((action, index) => (
                <Button 
                  key={index} 
                  onClick={action.handler}
                  color={index === 0 ? 'inherit' : 'primary'}
                >
                  {action.text}
                </Button>
              ))}
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardContainer>
  );
};

export default UserDashboard;