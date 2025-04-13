import React, { useState, useEffect } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@mui/material';
import Web3 from 'web3';
import axios from 'axios';
import Land from '../../abis/LandRegistry.json';

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
];

const GovtTable = ({ assetList }) => {
  const [landList, setLandList] = useState(null);
  const [account, setAccount] = useState('');
  const [images, setImages] = useState([]);
  const [open1, setOpen1] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3 = new Web3(
        Web3.givenProvider || process.env.QUICKNODE_RPC // Use Sepolia RPC
      );
      const accounts = await web3.eth.getAccounts();
      await window.localStorage.setItem('web3account', accounts[0]);
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const LandData = Land.networks[networkId];
      if (LandData) {
        const landList = new web3.eth.Contract(Land.abi, LandData.address);
        setLandList(landList);
      } else {
        window.alert('Token contract not deployed to detected network.');
      }
    };

    initWeb3();
  }, []);

  const handleAccept = async (id, status, status1, email, number) => {
    const flag = await landList.methods
      .govtStatus(id, status, status1)
      .send({
        from: account,
        gas: 1000000,
      });

    const data = {
      lemail: email,
      subject: status === 'Approved'
        ? 'Government has accepted your request.'
        : 'Government has rejected your request.',
      message: status === 'Approved'
        ? 'Government has accepted your request. Please check your account for more details.'
        : 'Government has rejected your request. Please check your account for more details.',
      number,
    };

    await axios.post('http://localhost:3001/send_mail', data);
    if (flag) window.location.reload();
  };

  const handleReviewTransfer = async (id, email, number) => {
    const data = {
      lemail: email,
      subject: 'Government has reviewed your land transfer request.',
      message: 'Your land transfer request has been reviewed. The stamp duty has been collected. Please check your account for more details.',
      number,
    };

    await axios.post('http://localhost:3001/send_mail', data);
    window.location.reload();
  };

  const handleViewImages = (images) => {
    setOpen1(true);
    setImages(images || []);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  return (
    <Paper>
      <TableContainer style={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                  <b>{column.label}</b>
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
                      {column.id === 'isGovtApproved' && value === 'Not Approved' && row.type === 'new_registration' ? (
                        <Grid container spacing={2}>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleAccept(
                                  row.property,
                                  'Approved',
                                  'GovtApproved',
                                  row.email,
                                  row.contact
                                )
                              }
                            >
                              Accept
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() =>
                                handleAccept(
                                  row.property,
                                  'Rejected',
                                  'GovtRejected',
                                  row.email,
                                  row.contact
                                )
                              }
                            >
                              Reject
                            </Button>
                          </Grid>
                        </Grid>
                      ) : column.id === 'isGovtApproved' && row.type === 'land_transfer' ? (
                        <Grid container spacing={2}>
                          <Grid item>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleReviewTransfer(row.property, row.email, row.contact)
                              }
                            >
                              Review and Collect Stamp Duty
                            </Button>
                          </Grid>
                        </Grid>
                      ) : column.id === 'document' ? (
                        <a href={row.document} target="_blank" rel="noopener noreferrer">
                          Download Document
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

      <Dialog
        open={open1}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose1}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title" style={{ textAlign: 'center' }}>
          {'View Images'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Land ${index}`}
                style={{ height: '300px', width: '400px', margin: '10px' }}
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

export default GovtTable;
