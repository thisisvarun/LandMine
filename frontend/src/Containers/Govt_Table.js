import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Land from '../abis/LandRegistry.json'
import axios from 'axios'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'
import Web3 from 'web3'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

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
]

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 600,
  },
})

class GovtTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      landList: null,
      account: '',
      images: [],
      open1: false,
    }
  }

  async componentDidMount() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    await window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const LandData = Land.networks[networkId]
    if (LandData) {
      const landList = new web3.eth.Contract(Land.abi, LandData.address)
      this.setState({ landList })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
  }

  handleAccept = async (id, status, status1, email, number) => {
    const flag = await this.state.landList.methods
      .govtStatus(id, status, status1)
      .send({
        from: this.state.account,
        gas: 1000000,
      })

    const data = {
      lemail: email,
      subject: status === 'Approved'
        ? 'Government has accepted your request.'
        : 'Government has rejected your request.',
      message: status === 'Approved'
        ? 'Government has accepted your request. Please check your account for more details.'
        : 'Government has rejected your request. Please check your account for more details.',
      number,
    }

    await axios.post('http://localhost:3001/send_mail', data)
    this.setState({ flag })
    if (flag) window.location.reload()
  }

  handleReviewTransfer = async (id, email, number) => {
    // No acceptance/rejection for land transfers, just collect stamp duty
    const data = {
      lemail: email,
      subject: 'Government has reviewed your land transfer request.',
      message: 'Your land transfer request has been reviewed. The stamp duty has been collected. Please check your account for more details.',
      number,
    }

    await axios.post('http://localhost:3001/send_mail', data)
    window.location.reload()
  }

  handleViewImages = (images) => {
    this.setState({ open1: true, images: images || [] })
  }

  handleClose1 = () => {
    this.setState({ open1: false })
  }

  render() {
    const { classes, assetList } = this.props

    return (
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
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
              {assetList.map((row) => (
                <TableRow hover key={row.property}>
                  {columns.map((column) => {
                    const value = row[column.id]

                    return (
                      <TableCell key={column.id}>
                        {column.id === 'isGovtApproved' && value === 'Not Approved' && row.type === 'new_registration' ? (
                          <Grid container spacing={2}>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  this.handleAccept(
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
                                  this.handleAccept(
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
                                  this.handleReviewTransfer(
                                    row.property,
                                    row.email,
                                    row.contact
                                  )
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
                            onClick={() => this.handleViewImages(row.images)}
                          >
                            View Images
                          </Button>
                        ) : (
                          value
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
              {this.state.images.map((image, index) => (
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
            <Button onClick={this.handleClose1} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    )
  }
}

export default withStyles(styles)(GovtTable)
