import React, { Component } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/system';
import Button from '@mui/material/Button';
import Land from '../../abis/LandRegistry.json';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import axios from 'axios';
import Web3 from 'web3';

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

const styles = {
  root: {
    width: '100%',
  },
};

class BuyerTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assetList: [],
      isLoading: true,
      images: [],
      open1: false,
      account: null,
    };
  }

  componentDidMount = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const accounts = await web3.eth.getAccounts()
      this.setState({ account: accounts[0] })
      const networkId = await web3.eth.net.getId()
      const LandData = Land.networks[networkId]
      if (LandData) {
        const landList = new web3.eth.Contract(Land.abi, LandData.address)
        this.setState({ landList })
      } else {
        window.alert('Token contract not deployed to detected network.')
      }
    } else {
      window.alert('Please install MetaMask or Trust Wallet.')
    }
  };

  handleAccept = async (id, email) => {
    await this.state.landList.methods.requstToLandOwner(id).send({
      from: this.state.account,
      gas: 1000000,
    });
    let data = {
      lemail: email,
      subject: `${this.state.uname} has requested to buy`,
      message: `${this.state.uname} has requested to buy the property. Please check your account for more details.`,
    };
    await axios
      .post('http://localhost:4000/send_mail', data)
      .then((response) => {
        if (response.status === 200) {
          alert('Message Sent.');
        } else {
          alert('Message failed to send.');
        }
      });
    window.location.reload();
  };

  handleBuy = async (id, amount) => {
    amount = amount * 1000000000000000000;
    let mValue = parseInt(amount);
    let StringValue = mValue.toString();
    await this.state.landList.methods.buyProperty(id).send({
      from: this.state.account,
      value: StringValue,
    });
    window.location.reload();
  };

  handleViewImages = async (images) => {
    this.setState({ open1: true });
    if (images) {
      this.setState({
        images: images,
      });
    }
  };

  handleClose1 = () => {
    this.setState({ open1: false });
  };

  render() {
    const { assetList } = this.props;

    return (
      <Paper className={styles.root}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    <b>{column.label}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assetList.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id}>
                          {column.id === 'isAvailable' && value === 'Available' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => this.handleAccept(row['property'], row['email'])}
                            >
                              Request to Buy
                            </Button>
                          ) : column.id === 'isAvailable' && value === 'GovtApproved' ? (
                            <div>Unavailable</div>
                          ) : column.id === 'isAvailable' && value === 'Approved' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => this.handleBuy(row['property'], row['lamount'])}
                            >
                              Buy
                            </Button>
                          ) : column.id === 'document' ? (
                            <a href={row['document']} download>
                              Download Document
                            </a>
                          ) : column.id === 'images' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => this.handleViewImages(row['images'])}
                            >
                              View Images
                            </Button>
                          ) : (
                            value
                          )}
                          <Dialog
                            open={this.state.open1}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={this.handleClose1}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                          >
                            <DialogTitle id="alert-dialog-slide-title" style={{ textAlign: 'center' }}>
                              {'View Images'}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-slide-description">
                                {this.state.images.map((image) => (
                                  <img
                                    src={image}
                                    style={{
                                      height: '300px',
                                      width: '400px',
                                      margin: '10px',
                                    }}
                                  />
                                ))}
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={this.handleClose1} color="primary">
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }
}

export default BuyerTable;
