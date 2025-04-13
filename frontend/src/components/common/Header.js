import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, AppBar, Toolbar, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 20px',
    background: '#222',
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 1000,
  },
  connectBtn: {
    background: '#328888',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: '16px',
  },
  navWrap: {
    background: '#111',
    padding: '10px 0',
    position: 'fixed',
    top: '60px',
    width: '100%',
    zIndex: 999,
  },
  navList: {
    display: 'flex',
    justifyContent: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navItem: {
    margin: '0 20px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: '18px',
    '&:hover': {
      color: '#328888',
    },
  },
  logoutBtn: {
    background: '#d9534f',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: '16px',
    color: '#fff',
    '&:hover': {
      background: '#c9302c',
    },
  },
}));

const Header = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isGovt, setIsGovt] = useState(false);
  const [account, setAccount] = useState(null);

  const classes = useStyles();

  useEffect(() => {
    const auth = window.localStorage.getItem('authenticated') === 'true';
    const govt = window.localStorage.getItem('govtAuthenticated') === 'true';
    setAuthenticated(auth);
    setIsGovt(govt);

    if (window.ethereum) {
      const fetchAccount = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error getting Trust Wallet account:", error);
        }
      };

      fetchAccount();

      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  const connectTrustWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        window.localStorage.setItem('web3account', accounts[0]);
        window.localStorage.setItem('authenticated', 'true');
      } catch (error) {
        console.error("Error connecting to Trust Wallet:", error);
      }
    } else {
      alert("Please install Trust Wallet or MetaMask to connect.");
    }
  };

  return (
    <div className={classes.grow}>
      {/* Top right connect button */}
      {!authenticated && !isGovt && (
        <div className={classes.topBar}>
          <Button variant="contained" className={classes.connectBtn} onClick={connectTrustWallet}>
            Connect with Trust Wallet
          </Button>
        </div>
      )}

      <AppBar position="static" className={classes.navWrap}>
        <Toolbar>
          <ul className={classes.navList}>
            <li className={classes.navItem}><Link to="/" className={classes.navLink}>Home</Link></li>

            {!authenticated && !isGovt && (
              <>
                <li className={classes.navItem}><Link to="/login" className={classes.navLink}>Login</Link></li>
                <li className={classes.navItem}><Link to="/signup" className={classes.navLink}>Sign Up</Link></li>
              </>
            )}

            {authenticated && !isGovt && (
              <>
                <li className={classes.navItem}><Link to="/dashboard" className={classes.navLink}>Dashboard</Link></li>
                <li className={classes.navItem}><Link to="/profile" className={classes.navLink}>Profile</Link></li>
                <li className={classes.navItem}>
                  <Button
                    variant="contained"
                    className={classes.logoutBtn}
                    onClick={() => {
                      window.localStorage.setItem('authenticated', 'false');
                      window.localStorage.removeItem('web3account');
                      setAuthenticated(false);
                      setAccount(null);
                    }}
                  >
                    Logout
                  </Button>
                </li>
              </>
            )}

            {isGovt && (
              <>
                <li className={classes.navItem}><Link to="/dashboard_govt" className={classes.navLink}>Govt Dashboard</Link></li>
                <li className={classes.navItem}>
                  <Button
                    variant="contained"
                    className={classes.logoutBtn}
                    onClick={() => {
                      window.localStorage.setItem('govtAuthenticated', 'false');
                      window.localStorage.removeItem('web3account');
                      setIsGovt(false);
                      setAccount(null);
                    }}
                  >
                    Logout
                  </Button>
                </li>
              </>
            )}

            <li className={classes.navItem}><Link to="/guide" className={classes.navLink}>FAQ</Link></li>
          </ul>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
