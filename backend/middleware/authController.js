const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Government = require('../models/Government');

// Token generation utility
const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role,
      address: user.walletAddress || user.address, // Works for both User and Government
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

// Enhanced auth middleware
const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Check user existence based on role
      let user;
      if (decoded.role === 'government') {
        user = await Government.findById(decoded.id).select('+lastAccess');
      } else {
        user = await User.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // 4. Role-based authorization
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient permissions' 
        });
      }

      // 5. Attach user to request
      req.user = user;
      req.token = token;

      // 6. Update last access for government users
      if (decoded.role === 'government') {
        user.lastAccess = new Date();
        await user.save();
      }

      next();
    } catch (err) {
      // Handle different JWT errors specifically
      const errorResponse = {
        success: false,
        error: 'Authentication failed'
      };

      if (err.name === 'TokenExpiredError') {
        errorResponse.error = 'Session expired';
        return res.status(401).json(errorResponse);
      }
      if (err.name === 'JsonWebTokenError') {
        errorResponse.error = 'Invalid token';
        return res.status(403).json(errorResponse);
      }

      console.error('Auth error:', err);
      res.status(500).json(errorResponse);
    }
  };
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password, isGovernment } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Government login flow
    if (isGovernment) {
      const govtUser = await Government.findOne({ username: email }).select('+password');
      
      if (!govtUser || !(await govtUser.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          error: 'Invalid government credentials'
        });
      }

      const token = generateToken(govtUser, 'government');
      
      return res.json({
        success: true,
        token,
        user: {
          id: govtUser._id,
          role: 'government',
          address: govtUser.address,
          username: govtUser.username
        }
      });
    }

    // Regular user login flow
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid user credentials'
      });
    }

    const token = generateToken(user, 'user');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        role: 'user',
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

module.exports = {
  authMiddleware,
  login,
  // Export for testing
  _generateToken: generateToken 
};