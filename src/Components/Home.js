import React, { Component } from "react";
import Typewriter from "react-typewriter-effect";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      isGovtAuthenticated: false,
    };
  }

  componentDidMount() {
    this.checkAuthentication();
  }

  checkAuthentication = () => {
    const isGovtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';
    const isUserAuth = window.localStorage.getItem('authenticated') === 'true';
  
    this.setState({
      isGovtAuthenticated: isGovtAuth,
      isAuthenticated: isUserAuth,
    });
  };
  

  handleLogout = () => {
    window.localStorage.removeItem("govtAuthenticated");
    window.localStorage.removeItem("authenticated");
    window.localStorage.removeItem("account");
    window.localStorage.removeItem("web3account");

    this.setState({ isAuthenticated: false, isGovtAuthenticated: false });

    this.props.history.push("/");
  };

  render() {
    const { isAuthenticated, isGovtAuthenticated } = this.state;
    const notLoggedIn = !isAuthenticated && !isGovtAuthenticated;
    const isGovt = isGovtAuthenticated && !isAuthenticated;

    return (
      <div className="bg">
        <div className="home-text">
          Land Registry
          <br /> Application
          <div className="typewriter">
            <Typewriter
              cursorColor="#fff"
              multiText={[
                "Trustable, Transparent and Digitalized Platform",
                "Open for all! Register Now.",
              ]}
            />
          </div>
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
