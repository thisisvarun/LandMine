import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Container } from '@material-ui/core'
import SendIcon from '@material-ui/icons/Send'
import axios from 'axios'
import Land from '../abis/LandRegistry.json'
import { withStyles } from '@material-ui/core/styles'

const styles = () => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormLabel-root': {
      color: '#fff',
    },
    '&  .MuiInputBase-root': {
      color: '#fff',
    },
    '&  .MuiInput-underline:before': {
      borderBottomColor: '#fff',
    },
    '&  .MuiInput-underline:after': {
      borderBottomColor: '#fff',
    },
    '&  .MuiInput-underline:hover': {
      borderBottomColor: '#fff',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: '#328888',
      fontFamily: "'Roboto Condensed', sans-serif",
    },
  },
})

class Register extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      address: '',
      postalCode: '',
      city: '',
      contact: '',
    }
  }

  componentDidMount = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const LandData = Land.networks[networkId]
    if (LandData) {
      const landList = new web3.eth.Contract(Land.abi, LandData.address)
      this.setState({ landList })
    } else {
      alert('Token contract not deployed to detected network.')
    }
    if (window.localStorage.getItem('authenticated') === 'true')
      window.location = '/dashboard'
  }

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value })
  }

  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  login = async (data) => {
    await this.state.landList.methods
      .addUser(
        data.privateKey,
        data.name,
        data.contact,
        data.email,
        data.postalCode,
        data.city,
      )
      .send({ from: this.state.account, gas: 1000000 })
      .on('receipt', (receipt) => {
        if (receipt) {
          alert('User has been added successfully!')
          window.location = '/login'
        } else {
          alert('Could not add User. Please try again')
        }
      })
  }

  handleSubmit = async () => {
    const { name, email, contact, privateKey, city, postalCode } = this.state;
  
    try {
      const response = await axios.post('http://localhost:4000/signup', {
        name,
        email,
        contact,
        accountAddress: privateKey, // Assuming privateKey is actually the Ethereum address
        city,
        postalCode,
      });
  
      if (response.data.success) {
        alert("Signup successful!");
        window.location = '/login';
      } else {
        alert(response.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Check console.");
    }
  };

  render() {
    const { classes } = this.props
    const { name, email, address, postalCode, city, contact } = this.state

    return (
      <div className="profile-bg">
        <Container style={{ marginTop: '40px' }} className={classes.root}>
          <div className="register-text">Register Here</div>
          <div className="input">
            <TextField
              label="Name"
              placeholder="Enter Your Name"
              fullWidth
              value={name}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('name')}
            />
            <TextField
              label="Email Address"
              placeholder="Enter Your Email Address"
              fullWidth
              value={email}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('email')}
            />
            <TextField
              label="Contact Number"
              placeholder="Enter Your Contact Number"
              fullWidth
              value={contact}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('contact')}
            />
            <TextField
              label="Private Key"
              placeholder="Enter Your Private Key"
              fullWidth
              value={address}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('address')}
            />
            <TextField
              label="City"
              placeholder="Enter Your City"
              fullWidth
              value={city}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('city')}
            />
            <TextField
              label="Postal Code"
              placeholder="Enter Your Postal Code"
              fullWidth
              value={postalCode}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={this.handleChange('postalCode')}
            />
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={this.handleSubmit}
            >
              Sign Up
            </Button>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#fff' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#328888' }}>
              Login here
            </a>
          </div>
        </Container>
      </div>
    )
  }
}

export default withStyles(styles)(Register)
