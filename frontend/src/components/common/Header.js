import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const styles = (theme) => ({
  grow: {
    flexGrow: 1,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 20px',
    background: '#222',
    position: 'fixed',  // Ensures the top bar is fixed at the top
    width: '100%',
    top: 0,
    zIndex: 1000,
  },
  connectBtn: {
    background: '#328888',
    color: '#fff',
    padding: '8px 16px',  // Increased padding for better readability
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: '16px',  // Slightly larger font size
  },
  navWrap: {
    background: '#111',
    padding: '10px 0',
    position: 'fixed', // Fixed header for better access on all pages
    top: '60px',  // Keep a gap for the top bar
    width: '100%',
    zIndex: 999, // Ensures the nav is below the top bar
  },
  navList: {
    display: 'flex',
    justifyContent: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navItem: {
    margin: '0 20px',  // Increased margin for spacing
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontFamily: "'Roboto Condensed', sans-serif",
    fontSize: '18px',  // Increased font size for better accessibility
    '&:hover': {
      color: '#328888',  // Hover effect for better visual feedback
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
      background: '#c9302c',  // Hover effect for logout button
    },
  },
});

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      isGovt: false,
      account: null,
    };
  }

  componentDidMount = async () => {
    const auth = window.localStorage.getItem('authenticated') === 'true';
    const govt = window.localStorage.getItem('govtAuthenticated') === 'true';

    this.setState({ authenticated: auth, isGovt: govt });

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.setState({ account: accounts[0] });
        }
      } catch (error) {
        console.error("Error getting Trust Wallet account:", error);
      }

      window.ethereum.on('accountsChanged', (accounts) => {
        this.setState({ account: accounts[0] || null });
      });
    }
  };

  connectTrustWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({ account: accounts[0] });
        window.localStorage.setItem('web3account', accounts[0]);
        window.localStorage.setItem('authenticated', 'true');
      } catch (error) {
        console.error("Error connecting to Trust Wallet:", error);
      }
    } else {
      alert("Please install Trust Wallet or MetaMask to connect.");
    }
  };

  render() {
    const { classes } = this.props;
    const { authenticated, isGovt } = this.state;

    return (
      <div className={classes.grow}>
        {/* Top right connect button */}
        {!authenticated && !isGovt && (
          <div className={classes.topBar}>
            <button className={classes.connectBtn} onClick={this.connectTrustWallet}>
              Connect with Trust Wallet
            </button>
          </div>
        )}

        <header className={classes.navWrap}>
          <nav>
            <ul className={classes.navList}>
              <li className={classes.navItem}><a href="/" className={classes.navLink}>Home</a></li>

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
                    <button
                      className={classes.logoutBtn}
                      onClick={() => {
                        window.localStorage.setItem('authenticated', 'false');
                        window.localStorage.removeItem('web3account');
                        this.setState({ authenticated: false, account: null });
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}

              {isGovt && (
                <>
                  <li className={classes.navItem}><Link to="/dashboard_govt" className={classes.navLink}>Govt Dashboard</Link></li>
                  <li className={classes.navItem}>
                    <button
                      className={classes.logoutBtn}
                      onClick={() => {
                        window.localStorage.setItem('govtAuthenticated', 'false');
                        window.localStorage.removeItem('web3account');
                        this.setState({ isGovt: false, account: null });
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}

              <li className={classes.navItem}><Link to="/guide" className={classes.navLink}>FAQ</Link></li>
            </ul>
          </nav>
        </header>
      </div>
    );
  }
}

export default withStyles(styles)(Header);
