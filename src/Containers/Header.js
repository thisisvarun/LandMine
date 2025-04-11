import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const styles = (theme) => ({
  grow: {
    flexGrow: 1,
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

    // Check if Trust Wallet (or MetaMask) is installed
    if (window.ethereum) {
      try {
        // Try to get the account and listen for account change events
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.setState({ account: accounts[0] });
        }
      } catch (error) {
        console.error("Error getting Trust Wallet account:", error);
      }

      // Listen for account change (if using Trust Wallet or MetaMask)
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.setState({ account: accounts[0] });
        } else {
          this.setState({ account: null });
        }
      });
    }
  };

  connectTrustWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access if Trust Wallet is available
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
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

    return (
      <div className={classes.grow}>
        <header id="header">
          <nav id="nav-wrap">
            <ul id="nav" className="nav">
              <li><a href="/">Home</a></li>

              {/* Display login and signup only if no user is authenticated */}
              {!this.state.authenticated && !this.state.isGovt && (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/signup">Sign Up</Link></li>
                </>
              )}

              {/* Display user-specific options if authenticated */}
              {this.state.authenticated && !this.state.isGovt && (
                <>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li>
                    <Link
                      to="/login"
                      onClick={() => {
                        window.localStorage.setItem('authenticated', 'false');
                        window.localStorage.removeItem('web3account');
                      }}
                    >
                      Logout
                    </Link>
                  </li>
                </>
              )}

              {/* Display govt-specific options if govt user is logged in */}
              {this.state.isGovt && (
                <>
                  <li><Link to="/dashboard_govt">Govt Dashboard</Link></li>
                  <li>
                    <Link
                      to="/govt_login"
                      onClick={() => {
                        window.localStorage.setItem('govtAuthenticated', 'false');
                        window.localStorage.removeItem('web3account');
                      }}
                    >
                      Logout
                    </Link>
                  </li>
                </>
              )}

              {/* Connect to Trust Wallet if the user is not authenticated */}
              {!this.state.authenticated && !this.state.isGovt && (
                <li>
                  <button onClick={this.connectTrustWallet}>Connect with Trust Wallet</button>
                </li>
              )}

              {/* Common FAQ link */}
              <li><Link to="/guide">FAQ</Link></li>
            </ul>
          </nav>
        </header>
      </div>
    );
  }
}

export default withStyles(styles)(Header);
