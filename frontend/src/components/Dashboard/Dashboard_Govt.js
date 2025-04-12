import React, { Component } from 'react';
import { Container, CircularProgress, Button } from '@material-ui/core';
import Land from '../../abis/LandRegistry.json';
import ipfs from '../ipfs';
import Table from '../../Containers/Govt_Table';
import { withStyles } from '@material-ui/core/styles';
import Web3 from 'web3';
import axios from 'axios';

const styles = {
  container: {
    '& .MuiContainer-maxWidthLg': {
      maxWidth: '100%',
    },
  },
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assetList: [],
      isLoading: true,
      landList: null,
      account: null,
    };
  }

  async componentDidMount() {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      const accounts = await web3.eth.getAccounts();
      window.localStorage.setItem('web3account', accounts[0]);

      const networkId = await web3.eth.net.getId();
      const LandData = Land.networks[networkId];
      if (LandData) {
        const landList = new web3.eth.Contract(Land.abi, LandData.address);
        this.setState({ landList, account: accounts[0] });
        this.getDetails(landList);
      } else {
        alert('Token contract not deployed to detected network.');
      }

      const res = await axios.get('http://localhost:4000/gov');
      this.setState({ assetList: res.data, isLoading: false });

    } catch (error) {
      console.error('Initialization error:', error);
      this.setState({ isLoading: false });
    }
  }

  async propertyDetails(property, landList) {
    try {
      const details = await landList.methods.landInfoOwner(property).call();
      ipfs.cat(details[1], (err, res) => {
        if (err) return console.error(err);
        const data = JSON.parse(res.toString());
        this.setState((prevState) => ({
          assetList: [
            ...prevState.assetList,
            {
              property,
              uniqueID: details[1],
              name: data.name,
              key: details[0],
              email: data.email,
              contact: data.contact,
              pan: data.pan,
              occupation: data.occupation,
              oaddress: data.address,
              ostate: data.state,
              ocity: data.city,
              opostalCode: data.postalCode,
              laddress: data.laddress,
              lstate: data.lstate,
              lcity: data.lcity,
              lpostalCode: data.lpostalCode,
              larea: data.larea,
              lamount: details[2],
              isGovtApproved: details[3],
              isAvailable: details[4],
              requester: details[5],
              requestStatus: details[6],
              document: data.document,
              images: data.images,
            },
          ],
        }));
      });
    } catch (error) {
      console.error('Error fetching property:', error);
    }
  }

  async getDetails(landList) {
    try {
      const properties = await landList.methods.Assets().call();
      properties.forEach((property) => {
        this.propertyDetails(property, landList);
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  // Function to approve land registration request
  approveRegistrationRequest = async (property) => {
    const { landList, account } = this.state;
    try {
      await landList.methods
        .approveLandRegistration(property)
        .send({ from: account });
      alert('Registration request approved!');
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration request.');
    }
  };

  // Function to deny land registration request
  denyRegistrationRequest = async (property) => {
    const { landList, account } = this.state;
    try {
      await landList.methods
        .denyLandRegistration(property)
        .send({ from: account });
      alert('Registration request denied!');
    } catch (error) {
      console.error('Error denying registration:', error);
      alert('Error denying registration request.');
    }
  };

  // Function to handle land transfer and collect stamp duty
  transferLand = async (property, newOwner) => {
    const { landList, account } = this.state;
    const stampDutyPercentage = 0.07;
    try {
      const details = await landList.methods.landInfoOwner(property).call();
      const landAmount = details[2]; // Get land amount
      const stampDuty = landAmount * stampDutyPercentage;

      // Transfer land and send stamp duty to government
      await landList.methods
        .transferLand(property, newOwner)
        .send({ from: account });

      // Transfer stamp duty to government account
      await landList.methods
        .transferToGovernment(0x383E286EA48E1626605e349C6a72c11e10CC46F1, stampDuty)
        .send({ from: account });

      alert('Land transferred and stamp duty collected!');
    } catch (error) {
      console.error('Error transferring land:', error);
      alert('Error during land transfer.');
    }
  };

  render() {
    const { classes } = this.props;
    const { isLoading, assetList } = this.state;

    return isLoading ? (
      <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
        <CircularProgress />
      </div>
    ) : (
      <div className="profile-bg">
        <div className={classes.container}>
          <Container style={{ marginTop: '100px' }}>
            <Table
              assetList={assetList}
              approveRegistrationRequest={this.approveRegistrationRequest}
              denyRegistrationRequest={this.denyRegistrationRequest}
              transferLand={this.transferLand}
            />
          </Container>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);