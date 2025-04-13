const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Government = require('../models/Government');
const { Web3 } = require('web3');


// Register a new user with private key (DEMO ONLY)
const signup = async (req, res) => {
  try {
    const { username, email, password, privateKey } = req.body;

    // Validate private key
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid private key format" 
      });
    }

    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Get address from private key
    const web3 = new Web3();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Create new user
    const user = new User({
      username,
      email,
      password,
      privateKey, // DEMO ONLY - THIS IS UNSAFE IN PRODUCTION
      publicAddress: account.address
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      success: true,
      token, 
      user: { 
        email, 
        username, 
        publicAddress: account.address,
        // Never expose private key in response
      } 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      demoWarning: "This implementation stores private keys - NEVER do this in production"
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, isGovernment } = req.body;
    let user, token;

    if (isGovernment) {
      user = await Government.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid government credentials' 
        });
      }
      token = jwt.sign(
        { id: user._id, role: 'government' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    } else {
      user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid user credentials' 
        });
      }
      token = jwt.sign(
        { id: user._id, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }

    res.json({ 
      success: true,
      token, 
      user: { 
        email: user.email, 
        role: isGovernment ? 'government' : 'user',
        walletAddress: user.walletAddress
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error during login' 
    });
  }
};

// Validate token
const validateToken = (req, res) => {
  res.json({ 
    success: true,
    valid: true, 
    user: req.user 
  });
};

module.exports = {
  signup,  // Changed from register to be more explicit
  login,
  validateToken
};