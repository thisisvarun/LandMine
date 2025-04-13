import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Web3 from 'web3';
import Signup from './pages/Signup/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/common/Header';
import RegistrationForm from './pages/AfterLogin/AddNewLand';
import Dashboard_Govt from './components/Dashboard/Dashboard_Govt';
import Profile from './components/Profile/Profile';
import Help from './components/Help/Help';
import Home from './components/common/Home';
import Login from './pages/Login/Login';
import { Routes, Route} from 'react-router-dom';


const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [govtAuthenticated, setGovtAuthenticated] = useState(false);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        window.localStorage.setItem('web3account', accounts[0]);
      }
    };

    const updateAuthState = () => {
      const auth = window.localStorage.getItem('authenticated') === 'true';
      const govtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';
      setAuthenticated(auth);
      setGovtAuthenticated(govtAuth);
    };

    loadWeb3();
    loadBlockchainData();
    updateAuthState();
  }, []);

  return (
    <Routes>
      <div className="App">
        <Header authenticated={authenticated} govtAuthenticated={govtAuthenticated} />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/dashboard_govt" component={Dashboard_Govt} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/registration_form" component={RegistrationForm} />
          <Route exact path="/guide" component={Help} />
        </Switch>
      </div>
    </Routes>
  );
};

export default App;
