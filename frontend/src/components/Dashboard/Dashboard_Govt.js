import React, { useState, useEffect } from 'react';
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
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';
import GovtTable from '../../pages/AfterLogin/Govt_Table';
import axios from 'axios';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const GOVERNMENT_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Should be in env

// Styled components
const DashboardContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  '& .MuiContainer-maxWidthLg': {
    maxWidth: '100%',
  },
}));

const StyledTabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const GovernmentDashboard = () => {
  const [state, setState] = useState({
    assetList: [],
    isLoading: true,
    landContract: null,
    account: null,
    error: null,
    activeTab: 0,
    txStatus: null,
    snackbarOpen: false,
    snackbarMessage: '',
    snackbarSeverity: 'success',
    dialogOpen: false,
    dialogConfig: null
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
        const landContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LandRegistry.abi,
          signer
        );

        setState(prev => ({
          ...prev,
          landContract,
          account: address,
          isLoading: false
        }));

        await fetchData(landContract);
      } catch (error) {
        handleError('Initialization error:', error);
      }
    };

    initialize();
  }, []);

  // Fetch data from blockchain and backend
  const fetchData = async (contract) => {
    try {
      const [backendData, properties] = await Promise.all([
        axios.get(`${API_URL}/gov`),
        contract.Assets()
      ]);

      const processedAssets = await processProperties(properties, contract);

      setState(prev => ({
        ...prev,
        assetList: [...backendData.data, ...processedAssets],
        isLoading: false
      }));
    } catch (error) {
      handleError('Data fetching error:', error);
    }
  };

  // Process blockchain properties
  const processProperties = async (properties, contract) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await contract.landInfoOwner(property);
        results.push({
          id: property,
          ...details,
          // Add any additional processing here
        });
      } catch (error) {
        console.error(`Error processing property ${property}:`, error);
      }
    }
    return results;
  };

  // Handle approval of land registration
  const handleApprove = async (propertyId) => {
    setState(prev => ({ ...prev, txStatus: 'approving' }));
    
    try {
      const tx = await state.landContract.approveLandRegistration(propertyId);
      showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
      
      await tx.wait();
      await fetchData(state.landContract);
      
      showSnackbar('Registration approved successfully!', 'success');
    } catch (error) {
      handleError('Approval error:', error);
      showSnackbar('Approval failed', 'error');
    } finally {
      setState(prev => ({ ...prev, txStatus: null }));
    }
  };

  // Handle denial of land registration
  const handleDeny = async (propertyId) => {
    setState(prev => ({ ...prev, txStatus: 'denying' }));
    
    try {
      const tx = await state.landContract.denyLandRegistration(propertyId);
      showSnackbar('Transaction submitted. Waiting for confirmation...', 'info');
      
      await tx.wait();
      await fetchData(state.landContract);
      
      showSnackbar('Registration denied successfully!', 'success');
    } catch (error) {
      handleError('Denial error:', error);
      showSnackbar('Denial failed', 'error');
    } finally {
      setState(prev => ({ ...prev, txStatus: null }));
    }
  };

  // Handle land transfer with confirmation dialog
  const initiateTransfer = (propertyId, currentOwner) => {
    setState(prev => ({
      ...prev,
      dialogOpen: true,
      dialogConfig: {
        title: 'Confirm Land Transfer',
        content: `Are you sure you want to transfer land ${propertyId} from ${currentOwner}?`,
        actions: [
          {
            text: 'Cancel',
            handler: () => setState(prev => ({ ...prev, dialogOpen: false }))
          },
          {
            text: 'Confirm',
            handler: () => handleTransfer(propertyId)
          }
        ]
      }
    }));
  };

  // Execute land transfer
  const handleTransfer = async (propertyId) => {
    setState(prev => ({ ...prev, dialogOpen: false, txStatus: 'transferring' }));
    
    try {
      const details = await state.landContract.landInfoOwner(propertyId);
      const landAmount = details[2];
      const stampDuty = landAmount * 0.07;

      // Execute transfer
      const transferTx = await state.landContract.transferLand(propertyId, GOVERNMENT_ADDRESS);
      showSnackbar('Transfer initiated. Processing stamp duty...', 'info');
      await transferTx.wait();

      // Process stamp duty
      const paymentTx = await state.landContract.transferToGovernment(GOVERNMENT_ADDRESS, stampDuty);
      await paymentTx.wait();

      await fetchData(state.landContract);
      showSnackbar('Land transferred and stamp duty collected!', 'success');
    } catch (error) {
      handleError('Transfer error:', error);
      showSnackbar('Transfer failed', 'error');
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

  return (
    <div className="profile-bg">
      <DashboardContainer>
        <AppBar position="static" color="default">
          <Tabs
            value={state.activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Land Registry" />
            <Tab label="Transactions" />
          </Tabs>
        </AppBar>

        <StyledTabPanel hidden={state.activeTab !== 0}>
          <GovtTable
            assetList={state.assetList}
            onApprove={handleApprove}
            onDeny={handleDeny}
            onTransfer={initiateTransfer}
            isLoading={state.txStatus !== null}
          />
        </StyledTabPanel>

        <StyledTabPanel hidden={state.activeTab !== 1}>
          {/* Transaction history component would go here */}
          <Box p={3}>
            <Alert severity="info">Transaction history feature coming soon</Alert>
          </Box>
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
              <DialogContent>{state.dialogConfig.content}</DialogContent>
              <DialogActions>
                {state.dialogConfig.actions.map((action, index) => (
                  <Button key={index} onClick={action.handler}>
                    {action.text}
                  </Button>
                ))}
              </DialogActions>
            </>
          )}
        </Dialog>
      </DashboardContainer>
    </div>
  );
};

export default GovernmentDashboard;