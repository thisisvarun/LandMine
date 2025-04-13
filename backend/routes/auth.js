const express = require('express');
const { 
  signup, 
  login,
  validateToken
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);  // Changed from register to signup
router.post('/login', login);

// Protected route to validate token
router.get('/validate', authMiddleware, validateToken);

module.exports = router;