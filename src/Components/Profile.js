import React, { Component } from 'react';
import { Container, Grid } from '@material-ui/core';
import Land from '../abis/LandRegistry.json';
import profile from '../images/avatar.png';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import MailIcon from '@material-ui/icons/Mail';
import PhoneIcon from '@material-ui/icons/Phone';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { withRouter } from 'react-router-dom';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      account: '',
      balance: '',
      uid: '',
      uname: '',
      ucontact: '',
      uemail: '',
      ucode: '',
      ucity: '',
      exist: false,
      landList: null,
    };
  }

  async componentDidMount() {
    const web3 = window.web3;

    if (!web3) {
      alert('Web3 not found. Please connect your wallet.');
      return;
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      alert('No wallet account found.');
      return;
    }

    const account = accounts[0];
    const balanceWei = await web3.eth.getBalance(account);
    const balanceEth = web3.utils.fromWei(balanceWei, 'ether');

    this.setState({ account, balance: balanceEth });

    const networkId = await web3.eth.net.getId();
    const LandData = Land.networks[networkId];
    if (LandData) {
      const landList = new web3.eth.Contract(Land.abi, LandData.address);
      this.setState({ landList });

      const user = await landList.methods.getUser(account).call();
      this.setState({
        uid: user[0],
        uname: user[1],
        ucontact: user[2],
        uemail: user[3],
        ucode: user[4],
        ucity: user[5],
        exist: user[6],
      });
    } else {
      window.alert('Token contract not deployed to the detected network.');
    }

    // Redirect if not authenticated
    const auth = window.localStorage.getItem('authenticated');
    if (!auth || auth !== 'true') {
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <div className="profile-bg">
        <Container>
          <div className="m-t-180">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <div>
                  <img className="profile-img" src={profile} alt="Profile" />
                </div>
              </Grid>
              <Grid item xs={12} md={8}>
                <div className="profile-text">
                  <div className="profile-h">{this.state.uname}</div>
                  <div>
                    <LocationOnIcon style={{ marginTop: '-10px' }} />
                    {'  '}
                    <span className="profile-t">{this.state.ucity}</span>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <MailIcon style={{ marginTop: '-10px' }} />
                    {'  '}
                    <span className="profile-t">{this.state.uemail}</span>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <PhoneIcon style={{ marginTop: '-10px' }} />
                    {'  '}
                    <span className="profile-t">+91-{this.state.ucontact}</span>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <VpnKeyIcon style={{ marginTop: '-10px' }} />
                    {'  '}
                    <span className="profile-t">{this.state.account}</span>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <AccountBalanceWalletIcon style={{ marginTop: '-10px' }} />
                    {'  '}
                    <span className="profile-t">{this.state.balance} ETH</span>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    );
  }
}

export default withRouter(Profile);
