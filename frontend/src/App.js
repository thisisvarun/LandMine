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
import { Routes, Route } from 'react-router-dom';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [govtAuthenticated, setGovtAuthenticated] = useState(false);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access using modern MetaMask API
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error('User denied account access', error);
          window.alert('Please allow MetaMask to connect to this app.');
        }
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          window.localStorage.setItem('web3account', accounts[0]);
        }
      }
    };

    const updateAuthState = () => {
      const auth = window.localStorage.getItem('authenticated') === 'true';
      const govtAuth = window.localStorage.getItem('govtAuthenticated') === 'true';
      setAuthenticated(auth);
      setGovtAuthenticated(govtAuth);
    };

    const initialize = async () => {
      await loadWeb3();
      await loadBlockchainData();
      updateAuthState();
    };

    initialize();
  }, []);

  return (
    <div className="App">
      <Header authenticated={authenticated} govtAuthenticated={govtAuthenticated} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard_govt" element={<Dashboard_Govt />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/registration_form" element={<RegistrationForm />} />
        <Route path="/guide" element={<Help />} />
      </Routes>
    </div>
  );
};

export default App;