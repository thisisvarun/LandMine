import React, { Component } from "react";
import Typewriter from "react-typewriter-effect";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false, // Regular user authentication status
      isGovtAuthenticated: false, // Government user authentication status
    };
  }

  componentDidMount() {
    // Check authentication from localStorage
    this.checkAuthentication();
  }

  checkAuthentication = () => {
    const isGovtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';
    const isUserAuth = window.localStorage.getItem('authenticated') === 'true';

    this.setState( {
      isGovtAuthenticated: isGovtAuth,
      isAuthenticated: isUserAuth,
    });
  }

  handleLogout = () => {
    // Clear the user data from localStorage (log out)
    window.localStorage.removeItem("govtAuthenticated");
    window.localStorage.removeItem("authenticated");
    window.localStorage.removeItem("account");
    window.localStorage.removeItem("web3account");

    // Reset the authentication state
    this.setState({ isAuthenticated: false, isGovtAuthenticated: false });

    // Redirect the user to the home page
    this.props.history.push("/"); // Redirect to the Home page
  };

  render() {
    const { isAuthenticated, isGovtAuthenticated } = this.state;

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

        {/* Conditionally render login/signup buttons or logout button */}
        {!isAuthenticated ? (
          // Show login and signup only if not authenticated (govt or regular user)
          <div className="home-button">
            <button
              style={{ marginRight: "15px" }}
              onClick={() => this.props.history.push("/signup")}
            >
              Register
            </button>{" "}
            <button onClick={() => this.props.history.push("/login")}>
              Login
            </button>
          </div>
        ) : (
          // Show logout button if authenticated (govt or regular user)
          <div className="home-button">
            {isGovtAuthenticated ? (
              <button onClick={this.handleLogout}>Logout (Govt)</button>
            ) : (
              <button onClick={this.handleLogout}>Logout</button>
            )}
          </div>
        )}
      </div>
    );
  }
}
