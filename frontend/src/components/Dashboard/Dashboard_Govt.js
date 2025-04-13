import React, { useState, useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';
import GovtTable from '../../pages/AfterLogin/Govt_Table';
import axios from 'axios';

// Styled components
const DashboardContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  '& .MuiContainer-maxWidthLg': {
    maxWidth: '100%',
  },
}));

const Dashboard = () => {
  const [state, setState] = useState({
    assetList: [],
    isLoading: true,
    landList: null,
    account: null,
    error: null
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Connect to Hardhat local node
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Initialize contract
        const landList = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS,
          LandRegistry.abi,
          signer
        );

        // Fetch initial data
        const [backendData, properties] = await Promise.all([
          axios.get('http://localhost:5000/gov'),
          landList.Assets()
        ]);

        // Process properties
        const processedAssets = await processProperties(properties, landList);

        setState({
          assetList: [...backendData.data, ...processedAssets],
          isLoading: false,
          landList,
          account: address
        });

      } catch (error) {
        console.error('Initialization error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    initialize();
  }, []);

  const processProperties = async (properties, landList) => {
    const results = [];
    for (const property of properties) {
      try {
        const details = await landList.landInfoOwner(property);
        // If using IPFS, you would fetch metadata here
        // const ipfsData = await fetchIPFSData(details.ipfsHash);
        
        results.push({
          property,
          ...details,
          // ...ipfsData
        });
      } catch (error) {
        console.error(`Error processing property ${property}:`, error);
      }
    }
    return results;
  };

  // Function to approve land registration request
  const approveRegistrationRequest = async (property) => {
    try {
      const tx = await state.landList.approveLandRegistration(property);
      await tx.wait();
      alert('Registration request approved!');
      window.location.reload();
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration request.');
    }
  };

  // Function to deny land registration request
  const denyRegistrationRequest = async (property) => {
    try {
      const tx = await state.landList.denyLandRegistration(property);
      await tx.wait();
      alert('Registration request denied!');
      window.location.reload();
    } catch (error) {
      console.error('Error denying registration:', error);
      alert('Error denying registration request.');
    }
  };

  // Function to handle land transfer and collect stamp duty
  const transferLand = async (property, newOwner) => {
    try {
      const details = await state.landList.landInfoOwner(property);
      const landAmount = details[2]; // Get land amount
      const stampDutyPercentage = 0.07;
      const stampDuty = landAmount * stampDutyPercentage;

      // Transfer land
      const transferTx = await state.landList.transferLand(property, newOwner);
      await transferTx.wait();

      // Transfer stamp duty to government account
      const paymentTx = await state.landList.transferToGovernment(
        '0x383E286EA48E1626605e349C6a72c11e10CC46F1', 
        stampDuty
      );
      await paymentTx.wait();

      alert('Land transferred and stamp duty collected!');
      window.location.reload();
    } catch (error) {
      console.error('Error transferring land:', error);
      alert('Error during land transfer.');
    }
  };

  if (state.isLoading) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)' 
      }}>
        <CircularProgress />
      </div>
    );
  }

  if (state.error) {
    return (
      <DashboardContainer>
        <div style={{ color: 'red', padding: '20px' }}>
          Error: {state.error}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <div className="profile-bg">
      <DashboardContainer>
        <GovtTable
          assetList={state.assetList}
          approveRegistrationRequest={approveRegistrationRequest}
          denyRegistrationRequest={denyRegistrationRequest}
          transferLand={transferLand}
        />
      </DashboardContainer>
    </div>
  );
};

export default Dashboard;