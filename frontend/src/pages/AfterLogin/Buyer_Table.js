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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import { ethers } from 'ethers';
import LandRegistry from '../../abis/LandRegistry.json';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const columns = [
  { id: 'property', label: 'Property ID', minWidth: 100 },
  { id: 'name', label: 'Owner Name', minWidth: 120 },
  { id: 'laddress', label: 'Land Address', minWidth: 180 },
  { id: 'lstate', label: 'State', minWidth: 100 },
  { id: 'lcity', label: 'City', minWidth: 100 },
  { id: 'lamount', label: 'Price (ETH)', minWidth: 100 },
  { id: 'document', label: 'Documents', minWidth: 120 },
  { id: 'images', label: 'Images', minWidth: 100 },
  { id: 'isGovtApproved', label: 'Approval Status', minWidth: 140 },
  { id: 'isAvailable', label: 'Availability', minWidth: 120 },
];

const BuyerTable = ({ assetList }) => {
  const [state, setState] = useState({
    images: [],
    openDialog: false,
    account: null,
    contract: null,
    loading: false
  });

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          const contract = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            LandRegistry.abi,
            signer
          );

          setState(prev => ({
            ...prev,
            account: address,
            contract
          }));
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
    };

    initialize();
  }, []);

  const handleRequestToBuy = async (propertyId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const tx = await state.contract.requstToLandOwner(propertyId, {
        gasLimit: 1000000
      });
      await tx.wait();
  
      // Removed the email sending part
      alert('Purchase request sent successfully!');
    } catch (error) {
      console.error("Request error:", error);
      alert('Error sending purchase request');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBuyProperty = async (propertyId, price) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const tx = await state.contract.buyProperty(propertyId, {
        value: ethers.parseEther(price.toString()),
        gasLimit: 1000000
      });
      await tx.wait();

      alert('Property purchased successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Purchase error:", error);
      alert('Error purchasing property');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleViewImages = (images) => {
    setState(prev => ({
      ...prev,
      images: images || [],
      openDialog: true
    }));
  };

  const handleCloseDialog = () => {
    setState(prev => ({ ...prev, openDialog: false }));
  };

  return (
    <>
      <Paper sx={{ 
        width: '100%',
        overflow: 'hidden',
        boxShadow: 3
      }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="available properties table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{ 
                      minWidth: column.minWidth,
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText'
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assetList.map((row) => (
                <TableRow hover key={row.property}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id}>
                        {column.id === 'isAvailable' && value === 'Available' ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleRequestToBuy(row.property, row.email)}
                            disabled={state.loading}
                            sx={{ textTransform: 'none' }}
                          >
                            Request to Buy
                          </Button>
                        ) : column.id === 'isAvailable' && value === 'Approved' ? (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleBuyProperty(row.property, row.lamount)}
                            disabled={state.loading}
                            sx={{ textTransform: 'none' }}
                          >
                            Complete Purchase
                          </Button>
                        ) : column.id === 'document' ? (
                          <Button
                            variant="outlined"
                            component="a"
                            href={row.document}
                            target="_blank"
                            rel="noopener"
                            sx={{ textTransform: 'none' }}
                          >
                            View Documents
                          </Button>
                        ) : column.id === 'images' ? (
                          <Button
                            variant="outlined"
                            onClick={() => handleViewImages(row.images)}
                            sx={{ textTransform: 'none' }}
                          >
                            View Images
                          </Button>
                        ) : column.id === 'lamount' ? (
                          `${parseFloat(value).toFixed(4)} ETH`
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
      </Paper>

      <Dialog
        open={state.openDialog}
        TransitionComponent={Transition}
        onClose={handleCloseDialog}
        maxWidth="md"
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          Property Images
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center'
          }}>
            {state.images.map((image, index) => (
              <Box
                key={index}
                component="img"
                src={image}
                alt={`Property ${index + 1}`}
                sx={{
                  maxHeight: '400px',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BuyerTable;