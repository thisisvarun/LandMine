import React, { Component } from "react";
import Web3 from 'web3';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      isGovtAuthenticated: false,
      account: '',
    };
  }

  componentDidMount() {
    this.checkAuthentication();
  }

  checkAuthentication = async () => {
    // Check if Trust Wallet is connected
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();  // Ensure the wallet is connected
      const accounts = await web3.eth.getAccounts();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const isUserAuth = window.localStorage.getItem('authenticated') === 'true';
        const isGovtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';

        this.setState({
          isAuthenticated: isUserAuth,
          isGovtAuthenticated: isGovtAuth,
          account: account,
        });
      }
    }
  };

  handleLogout = () => {
    window.localStorage.removeItem("govtAuthenticated");
    window.localStorage.removeItem("authenticated");
    window.localStorage.removeItem("account");
    window.localStorage.removeItem("web3account");

    this.setState({ isAuthenticated: false, isGovtAuthenticated: false, account: '' });

    this.props.history.push("/");
  };

  render() {
    const { isAuthenticated, isGovtAuthenticated, account } = this.state;
    const notLoggedIn = !isAuthenticated && !isGovtAuthenticated;
    const isGovt = isGovtAuthenticated && !isAuthenticated;

    return (
      <div className="bg">
        <div className="home-text">
          Secure Land<br></br>Registration
          <br /> Application
          
          <hr
            style={{
              border: "8px solid #fff",
              width: "200px",
              marginLeft: "0px",
            }}
          />
        </div>

        {notLoggedIn ? (
          <div className="home-button">
            <button
              style={{ marginRight: "15px" }}
              onClick={() => this.props.history.push("/signup")}
            >
              Register
            </button>
            <button onClick={() => this.props.history.push("/login")}>
              Login
            </button>
          </div>
        ) : (
          <div className="home-button">
            <button onClick={this.handleLogout}>
              Logout {isGovtAuthenticated ? "(Govt)" : ""}
            </button>
          </div>
        )}
      </div>
    );
  }
}
