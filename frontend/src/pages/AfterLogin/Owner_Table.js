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
  DialogContentText,
  DialogTitle,
  Slide,
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
  { id: 'isGovtApproved', label: 'Status of Land Approval (by the Govt.)', minWidth: 100 },
  { id: 'isAvailable', label: 'Land Availability Status', minWidth: 100 },
  { id: 'requester', label: 'Requestor Info', minWidth: 100 },
];

const OwnerTable = ({ assetList }) => {
  const [state, setState] = useState({
    account: null,
    landList: null,
    open: false,
    open1: false,
    images: [],
    requesterInfo: {
      name: '',
      contact: '',
      city: '',
      code: '',
    },
  });

  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();

          localStorage.setItem('web3account', address);

          const landList = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            LandRegistry.abi,
            signer
          );

          setState((prev) => ({
            ...prev,
            account: address,
            landList,
          }));
        } catch (error) {
          console.error('Error connecting to wallet:', error);
        }
      } else {
        console.log('Please install a compatible wallet like MetaMask!');
      }
    };

    initialize();
  }, []);

  const handleAccept = async (id) => {
    try {
      const tx = await state.landList.makeAvailable(id, {
        gasLimit: 1000000,
      });
      await tx.wait();
      alert('Property made available successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error making property available:', error);
      alert('Failed to make property available');
    }
  };

  const handleProcessRequest = async (id, n) => {
    try {
      const tx = await state.landList.processRequest(id, n, {
        gasLimit: 1000000,
      });
      await tx.wait();

      alert(`Request ${n === 3 ? 'accepted' : 'rejected'} successfully!`);
      window.location.reload();
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Failed to process request');
    }
  };

  const handleRequesterInfo = async (address) => {
    try {
      const user = await state.landList.getUser(address);

      if (user) {
        setState((prev) => ({
          ...prev,
          open: true,
          requesterInfo: {
            name: user[1],
            contact: user[2],
            city: user[5],
            code: user[4],
          },
        }));
      }
    } catch (error) {
      console.error('Error fetching requester info:', error);
      alert('Failed to load requester info');
    }
  };

  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleViewImages = (images) => {
    setState((prev) => ({
      ...prev,
      open1: true,
      images: images || [],
    }));
  };

  const handleClose1 = () => {
    setState((prev) => ({ ...prev, open1: false }));
  };

  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                  <b>{column.label}</b>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {assetList.map((row) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={row.property}>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.id === 'isAvailable' && value === 'GovtApproved' ? (
                        <Button variant="contained" color="primary" onClick={() => handleAccept(row.property)}>
                          Make Available
                        </Button>
                      ) : column.id === 'isAvailable' && value === 'Pending' ? (
                        <Grid container spacing={2}>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleProcessRequest(row.property, 3)}
                            >
                              Accept
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleProcessRequest(row.property, 2)}
                            >
                              Reject
                            </Button>
                          </Grid>
                        </Grid>
                      ) : column.id === 'requester' && value !== '0x0000000000000000000000000000000000000000' ? (
                        <Button variant="contained" color="primary" onClick={() => handleRequesterInfo(row.requester)}>
                          View Request
                        </Button>
                      ) : column.id === 'requester' && value === '0x0000000000000000000000000000000000000000' ? (
                        <span>No Requestor</span>
                      ) : column.id === 'document' ? (
                        <a href={row.document} download>
                          Download Document
                        </a>
                      ) : column.id === 'images' ? (
                        <Button variant="contained" color="primary" onClick={() => handleViewImages(row.images)}>
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

      {/* Requester Info Dialog */}
      <Dialog open={state.open} TransitionComponent={Transition} keepMounted onClose={handleClose}>
        <DialogTitle style={{ textAlign: 'center' }}>Requestor Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <b>Name:</b> {state.requesterInfo.name}
            <br />
            <b>Contact Number:</b> {state.requesterInfo.contact}
            <br />
            <b>City:</b> {state.requesterInfo.city}
            <br />
            <b>Postal Code:</b> {state.requesterInfo.code}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Images Dialog */}
      <Dialog open={state.open1} TransitionComponent={Transition} keepMounted onClose={handleClose1}>
        <DialogTitle style={{ textAlign: 'center' }}>View Images</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {state.images.map((image, index) => (
              <img
                key={index}
                src={image}
                style={{ height: '300px', width: '400px', margin: '10px' }}
                alt="land"
              />
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose1} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OwnerTable;