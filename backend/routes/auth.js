const express = require('express');
const { login, register } = require('../middleware/authController');

const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for user login
router.post('/login', login);

module.exports = router;