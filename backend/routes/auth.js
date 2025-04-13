const express = require('express');
const { 
  login,
  register,
  validateToken
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', register);
router.post('/login', login);

// Protected test route (example)
router.get('/validate', authMiddleware, validateToken);

module.exports = router;