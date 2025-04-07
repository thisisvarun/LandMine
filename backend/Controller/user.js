const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../Config/db_config');
const User = require('../Model/User');
const Govt = require('../Model/Government_Registrar');

// Helper function for error responses
const errorResponse = (res, status, message) => {
  return res.status(status).json({ success: false, error: message });
};

// User Signup
router.post('/signup', async (req, res) => {
  const { email, name, contact, privateKey, governmentId, city, postalCode, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !name || !contact || !privateKey || !governmentId || !city || !postalCode || !password) {
      return errorResponse(res, 400, 'All fields are required');
    }

    // Check for existing user by email, privateKey, or governmentId
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { privateKey },
        { governmentId }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse(res, 400, 'Email already in use');
      }
      if (existingUser.privateKey === privateKey) {
        return errorResponse(res, 400, 'Private key already in use');
      }
      if (existingUser.governmentId === governmentId) {
        return errorResponse(res, 400, 'Government ID already in use');
      }
    }

    // Create new user
    const newUser = new User({
      email,
      name,
      contact,
      privateKey,
      governmentId,
      city,
      postalCode,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user
    await newUser.save();

    // Create JWT token
    const payload = { 
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });

    // Omit sensitive data from response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      governmentId: newUser.governmentId,
      city: newUser.city
    };

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Signup error:', err);
    errorResponse(res, 500, 'Server error during registration');
  }
});

// Government ID Login
router.post('/government-login', async (req, res) => {
  const { governmentId, password } = req.body;

  try {
    if (!governmentId || !password) {
      return errorResponse(res, 400, 'Government ID and password are required');
    }

    const user = await User.findOne({ governmentId });
    if (!user) {
      return errorResponse(res, 404, 'User not found with this Government ID');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Create JWT token
    const payload = { 
      userId: user._id,
      email: user.email,
      governmentId: user.governmentId,
      role: user.role
    };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });

    // Omit sensitive data from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      governmentId: user.governmentId,
      role: user.role
    };

    res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (err) {
    console.error('Government login error:', err);
    errorResponse(res, 500, 'Server error during login');
  }
});

// ... (keep other existing routes but update error handling similarly)

module.exports = router;