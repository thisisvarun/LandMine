import React, { Component } from 'react'
// { withRouter, Redirect } from 'react-router-dom'
import { Container, CircularProgress } from '@material-ui/core'
import Land from '../abis/LandRegistry.json'
import ipfs from '../ipfs'
import Table from '../Containers/Owner_Table'
import AvailableTable from '../Containers/Buyer_Table'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import PropTypes from 'prop-types'
import RegistrationForm from '../Containers/RegistrationForm'
import axios from 'axios'
import Web3 from 'web3'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  }
}

const styles = (theme) => ({
  container: {
    '& .MuiContainer-maxWidthLg': {
      maxWidth: '100%',
    },
  },
  root: {
    backgroundColor: '#fff',
    borderRadius: '5px',
    minHeight: '80vh',
  },
})

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assetList: [],
      assetList1: [],
      isLoading: true,
      value: 0,
    }
  }

  componentDidMount = async () => {
    // Use Trust Wallet via the Web3 provider
    const web3 = new Web3(window.ethereum) // Trust Wallet uses window.ethereum
    const accounts = await web3.eth.requestAccounts() // Request accounts via Trust Wallet
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

    this.setState({ isLoading: false })
    this.getDetails()
    this.getDetails1()

    try {
      let res = await axios.get('http://localhost:4000/owner')
      res = res.data
      this.setState({ assetList: [...res] })
    } catch (error) {
      console.log(error)
    }
  }

  async propertyDetails(property) {
    let details = await this.state.landList.methods
      .landInfoOwner(property)
      .call()
    ipfs.cat(details[1], (err, res) => {
      if (err) {
        console.error(err)
        return
      }
      const temp = JSON.parse(res.toString())
      this.state.assetList.push({
        property: property,
        uniqueID: details[1],
        name: temp.name,
        key: details[0],
        email: temp.email,
        contact: temp.contact,
        pan: temp.pan,
        occupation: temp.occupation,
        oaddress: temp.address,
        ostate: temp.state,
        ocity: temp.city,
        opostalCode: temp.postalCode,
        laddress: temp.laddress,
        lstate: temp.lstate,
        lcity: temp.lcity,
        lpostalCode: temp.lpostalCode,
        larea: temp.larea,
        lamount: details[2],
        isGovtApproved: details[3],
        isAvailable: details[4],
        requester: details[5],
        requestStatus: details[6],
        document: temp.document,
        images: temp.images,
      })
      this.setState({ assetList: [...this.state.assetList] })
    })
  }

  async propertyDetails1(property) {
    let details = await this.state.landList.methods
      .landInfoOwner(property)
      .call()
    ipfs.cat(details[1], (err, res) => {
      if (err) {
        console.error(err)
        return
      }
      const temp = JSON.parse(res.toString())

      if (
        details[0] !== this.state.account &&
        (details[5] === this.state.account ||
          details[5] === '0x0000000000000000000000000000000000000000')
      ) {
        this.state.assetList1.push({
          property: property,
          uniqueID: details[1],
          name: temp.name,
          key: details[0],
          email: temp.email,
          contact: temp.contact,
          pan: temp.pan,
          occupation: temp.occupation,
          oaddress: temp.address,
          ostate: temp.state,
          ocity: temp.city,
          opostalCode: temp.postalCode,
          laddress: temp.laddress,
          lstate: temp.lstate,
          lcity: temp.lcity,
          lpostalCode: temp.lpostalCode,
          larea: temp.larea,
          lamount: details[2],
          isGovtApproved: details[3],
          isAvailable: details[4],
          requester: details[5],
          requestStatus: details[6],
          document: temp.document,
          images: temp.images,
        })
        this.setState({ assetList1: [...this.state.assetList1] })
      }
    })
  }

  async getDetails() {
    const properties = await this.state.landList.methods
      .viewAssets()
      .call({ from: this.state.account })
    for (let item of properties) {
      this.propertyDetails(item)
    }
  }

  async getDetails1() {
    const properties = await this.state.landList.methods.Assets().call()
    for (let item of properties) {
      this.propertyDetails1(item)
    }
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue })
  }

  handleChangeIndex = (index) => {
    this.setState({ index })
  }

  render() {
    const { classes } = this.props
    return this.state.isLoading ? (
      <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
        <CircularProgress />
      </div>
    ) : (
      <div className="profile-bg ">
        <div className={classes.container}>
          <Container style={{ marginTop: '40px' }}>
            <div className={classes.root}>
              <AppBar position="static" color="default" className="dashboard">
                <Tabs
                  value={this.state.value}
                  onChange={this.handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="My Properties" {...a11yProps(0)} />
                  <Tab label="Available Properties" {...a11yProps(1)} />
                  <Tab label="Register Land" {...a11yProps(2)} />
                </Tabs>
              </AppBar>
              <TabPanel value={this.state.value} index={0}>
                <div style={{ marginTop: '60px' }}>
                  <Table assetList={this.state.assetList} />
                </div>
              </TabPanel>
              <TabPanel value={this.state.value} index={1}>
                <div style={{ marginTop: '60px' }}>
                  <AvailableTable assetList={this.state.assetList1} />
                </div>
              </TabPanel>
              <TabPanel value={this.state.value} index={2}>
                <RegistrationForm />
              </TabPanel>
            </div>
          </Container>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(Dashboard)
