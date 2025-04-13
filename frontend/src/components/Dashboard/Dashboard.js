import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CircularProgress, 
  AppBar, 
  Tabs, 
  Tab, 
  Box,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers'; // Main ethers import
// For ethers v6, we don't need separate imports for providers
import LandRegistry from '../../abis/LandRegistry.json';
import Table from '../../pages/AfterLogin/Owner_Table';
import AvailableTable from '../../pages/AfterLogin/Buyer_Table';
import RegistrationForm from '../../pages/AfterLogin/AddNewLand';
import axios from 'axios';

// Hardhat configuration
const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const StyledTabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const Dashboard = () => {
  const [state, setState] = useState({
    assetList: [],
    assetList1: [],
    isLoading: true,
    error: null,
    value: 0,
    account: null,
    contract: null
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Connect to Hardhat local node - ethers v6 syntax
        const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Initialize contract - ethers v6 syntax
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LandRegistry.abi,
          signer
        );

        setState(prev => ({
          ...prev,
          account: address,
          contract,
          isLoading: false
        }));

        await fetchData(contract, address);
      } catch (error) {
        console.error('Initialization error:', error);
        setState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false
        }));
      }
    };

    initialize();
  }, []);

  const fetchData = async (contract, account) => {
    try {
      const [ownerProperties, allProperties, ownerData] = await Promise.all([
        contract.viewAssets({ from: account }),
        contract.Assets(),
        axios.get('http://localhost:5000/owner')
      ]);

      const processedAssets = await processProperties(ownerProperties, contract);
      const processedAvailableAssets = await processAvailableProperties(allProperties, contract, account);

      setState(prev => ({
        ...prev,
        assetList: [...ownerData.data, ...processedAssets],
        assetList1: processedAvailableAssets,
        isLoading: false
      }));
    } catch (error) {
      console.error('Data fetching error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const processProperties = async (properties, contract) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await contract.landInfoOwner(property);
        results.push({
          property,
          ...details,
        });
      } catch (error) {
        console.error(`Error processing property ${property}:`, error);
      }
    }
    return results;
  };

  const processAvailableProperties = async (properties, contract, account) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await contract.landInfoOwner(property);
        
        if (details.owner !== account && details.isAvailable) {
          results.push({
            property,
            ...details,
          });
        }
      } catch (error) {
        console.error(`Error processing available property ${property}:`, error);
      }
    }
    return results;
  };

  const handleChange = (event, newValue) => {
    setState(prev => ({ ...prev, value: newValue }));
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
      <Container>
        <Alert severity="error" sx={{ my: 2 }}>
          {state.error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <AppBar position="static" color="default">
        <Tabs
          value={state.value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="My Properties" />
          <Tab label="Available Properties" />
          <Tab label="Register Land" />
        </Tabs>
      </AppBar>

      <StyledTabPanel hidden={state.value !== 0}>
        <Table assetList={state.assetList} />
      </StyledTabPanel>

      <StyledTabPanel hidden={state.value !== 1}>
        <AvailableTable assetList={state.assetList1} />
      </StyledTabPanel>

      <StyledTabPanel hidden={state.value !== 2}>
        <RegistrationForm contract={state.contract} account={state.account} />
      </StyledTabPanel>
    </Container>
  );
};

export default Dashboard;