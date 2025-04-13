import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGovtAuthenticated, setIsGovtAuthenticated] = useState(false);
  const [account, setAccount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable(); // Ensure the wallet is connected
      const accounts = await web3.eth.getAccounts();

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        const isUserAuth = window.localStorage.getItem('authenticated') === 'true';
        const isGovtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';

        setIsAuthenticated(isUserAuth);
        setIsGovtAuthenticated(isGovtAuth);
        setAccount(account);
      }
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("govtAuthenticated");
    window.localStorage.removeItem("authenticated");
    window.localStorage.removeItem("account");
    window.localStorage.removeItem("web3account");

    setIsAuthenticated(false);
    setIsGovtAuthenticated(false);
    setAccount('');

    navigate("/");  // Use useNavigate for routing
  };

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
            onClick={() => navigate("/signup")}
          >
            Register
          </button>
          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      ) : (
        <div className="home-button">
          <button onClick={handleLogout}>
            Logout {isGovtAuthenticated ? "(Govt)" : ""}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
