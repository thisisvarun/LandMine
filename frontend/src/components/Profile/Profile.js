import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import profile from '../../assets/images/avatar.png';
import MailIcon from '@mui/icons-material/Mail';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Web3 from 'web3';
import Land from '../../abis/LandRegistry.json'; // Import the ABI here
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [uname, setUname] = useState('');
  const [uemail, setUemail] = useState('');
  const [exist, setExist] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook

  useEffect(() => {
    const loadData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
          alert('No wallet account found.');
          return;
        }

        const account = accounts[0];
        const balanceWei = await web3.eth.getBalance(account);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');

        setAccount(account);
        setBalance(balanceEth);

        const networkId = await web3.eth.net.getId();
        const LandData = Land.networks[networkId];
        if (LandData) {
          const landList = new web3.eth.Contract(Land.abi, LandData.address);

          const user = await landList.methods.getUser(account).call();
          setUname(user[1]);
          setUemail(user[3]);
          setExist(user[6]);
        } else {
          window.alert('Smart contract not deployed to the detected network.');
        }

        const auth = window.localStorage.getItem('authenticated');
        if (!auth || auth !== 'true') {
          navigate('/login'); // Use navigate hook for redirection
        }
      } else {
        alert('Please install Trust Wallet or MetaMask.');
      }
    };

    loadData();
  }, [navigate]);

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
                <div className="profile-h">{uname}</div>
                <div style={{ marginTop: '10px' }}>
                  <MailIcon style={{ marginTop: '-10px' }} />
                  {'  '}
                  <span className="profile-t">{uemail}</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <VpnKeyIcon style={{ marginTop: '-10px' }} />
                  {'  '}
                  <span className="profile-t">{account}</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <AccountBalanceWalletIcon style={{ marginTop: '-10px' }} />
                  {'  '}
                  <span className="profile-t">{balance} ETH</span>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

export default Profile;
