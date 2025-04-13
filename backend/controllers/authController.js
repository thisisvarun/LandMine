const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Government = require('../models/Government');
const { Web3 } = require('web3');

// Hardhat test accounts for demo
// const HARDHAT_TEST_KEYS = [
//   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account #0
//   "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"  // Account #1
// ];

// Register a new user with private key (DEMO ONLY)
const signup = async (req, res) => {
  try {
    const { username, email, password, privateKey } = req.body;

    // Validate private key format
    if (!privateKey.startsWith('0x') || privateKey.length !== 64) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid private key format" 
      });
    }

    // Verify it's a known Hardhat test key (demo safety check)
    // if (!HARDHAT_TEST_KEYS.includes(privateKey)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid test private key" 
    //   });
    // }

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
    const walletAddress = account.address;

    // Create new user (password hashing done in model)
    const user = new User({
      username,
      email,
      password,
      privateKey, // Storing for demo - NEVER do this in production!
      walletAddress
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
        walletAddress,
        // Never expose private key in response
        // even in demo, this is just for illustration
      } 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error during registration' 
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