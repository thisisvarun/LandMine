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
