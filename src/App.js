import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Register from './Components/Register';
import Dashboard from './Components/Dashboard';
import Header from './Containers/Header';
import RegistrationForm from './Containers/RegistrationForm';
import Dashboard_Govt from './Components/Dashboard_Govt';
import Profile from './Components/Profile';
import Help from './Components/Help';
import Home from './Components/Home';
import CombinedLogin from './Components/CombinedLogin';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      govtAuthenticated: false,
    };
  }

  async componentDidMount() {
    this.updateAuthState();
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.authenticated !== this.state.authenticated ||
      prevState.govtAuthenticated !== this.state.govtAuthenticated
    ) {
      this.updateAuthState();
    }
  }

  updateAuthState = () => {
    const authenticated = window.localStorage.getItem('authenticated') === 'true';
    const govtAuthenticated = window.localStorage.getItem('govtAuthenticated') === 'true';
    this.setState({ authenticated, govtAuthenticated });
  };

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    window.localStorage.setItem('web3account', accounts[0]);
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Header authenticated={this.state.authenticated} govtAuthenticated={this.state.govtAuthenticated} />
          <Switch>
            <Route exact path="/" render={() => <Home authenticated={this.state.authenticated} govtAuthenticated={this.state.govtAuthenticated} />} />
            <Route exact path="/signup" component={Register} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/login" component={CombinedLogin} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/registration_form" component={RegistrationForm} />
            <Route exact path="/dashboard_govt" component={Dashboard_Govt} />
            <Route exact path="/guide" component={Help} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
