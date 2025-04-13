import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Grid, 
  Dialog, 
  DialogActions, 
  DialogContent,
  DialogTitle, 
  Slide 
} from '@mui/material';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const columns = [
  { id: 'property', label: 'Property ID', minWidth: 100 },
  { id: 'name', label: 'Full Name', minWidth: 100 },
  { id: 'laddress', label: 'Land Details', minWidth: 170 },
  { id: 'lstate', label: 'State', minWidth: 100 },
  { id: 'lcity', label: 'City', minWidth: 100 },
  { id: 'lamount', label: 'Total Amount (in Rs)', minWidth: 100 },
  { id: 'document', label: 'Documents', minWidth: 100 },
  { id: 'images', label: 'Land Images', minWidth: 100 },
  { id: 'isGovtApproved', label: 'Status of Land Approval', minWidth: 100 },
  { id: 'isAvailable', label: 'Land Availability', minWidth: 100 },
];

const GovtTable = ({ assetList }) => {
  const [state, setState] = useState({
    landList: null,
    account: '',
    images: [],
    open1: false
  });

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          // Initialize ethers provider with Hardhat local node
          const provider = new ethers.BrowserProvider(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          localStorage.setItem('web3account', address);
          
          // Initialize contract
          const landList = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            LandRegistry.abi,
            signer
          );

          setState(prev => ({
            ...prev,
            account: address,
            landList
          }));
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      } else {
        console.log('Please install MetaMask!');
      }
    };

    initialize();
  }, []);

  const handleAccept = async (id, status, status1) => { // Removed email and number params
    try {
      const tx = await state.landList.govtStatus(id, status, status1, {
        gasLimit: 1000000
      });
      await tx.wait();
      
      alert(`Land request ${status.toLowerCase()} successfully!`);
      window.location.reload();
    } catch (error) {
      console.error("Error processing approval:", error);
      alert(`Error ${status.toLowerCase()}ing request`);
    }
  };

  const handleReviewTransfer = async (id) => { // Removed email and number params
    try {
      // If you need to do any blockchain operation here, add it
      alert("Land transfer reviewed successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error processing transfer review:", error);
      alert("Error reviewing transfer");
    }
  };


  const handleViewImages = (images) => {
    setState(prev => ({
      ...prev,
      open1: true,
      images: images || []
    }));
  };

  const handleClose1 = () => {
    setState(prev => ({ ...prev, open1: false }));
  };

  return (
    <Paper>
      <TableContainer style={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          {/* ... (TableHead remains the same) */}
          <TableBody>
            {assetList.map((row) => (
              <TableRow hover key={row.property}>
                {columns.map((column) => {
                  const value = row[column.id];

                  return (
                    <TableCell key={column.id}>
                      {column.id === 'isGovtApproved' && value === 'Not Approved' && row.type === 'new_registration' ? (
                        <Grid container spacing={2}>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleAccept(row.property, 'Approved', 'GovtApproved')}
                            >
                              Approve
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleAccept(row.property, 'Rejected', 'GovtRejected')}
                            >
                              Reject
                            </Button>
                          </Grid>
                        </Grid>
                      ) : column.id === 'isGovtApproved' && row.type === 'land_transfer' ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleReviewTransfer(row.property)}
                        >
                          Review Transfer
                        </Button>
                      ) : column.id === 'document' ? (
                        <a href={row.document} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      ) : column.id === 'images' ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewImages(row.images)}
                        >
                          View Images
                        </Button>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ... (Dialog for images remains the same) */}
    </Paper>
  );
};

export default GovtTable;