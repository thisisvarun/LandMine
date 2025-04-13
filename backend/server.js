const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config({ path: '../.env' });

const seedGovernmentUser = require('./config/seed');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  seedGovernmentUser(); // Seed the government user
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Mongoose model
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  privateKey: String,
});
const User = mongoose.model('User', UserSchema);

// Login route
app.post('/login', async (req, res) => {
  const { email, password, isGovt } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    if (isGovt) {
      const Government = require('./models/Government');
      const govtUser = await Government.findOne({ username: email }); // this assumes you're using `username` for govt login
      if (!govtUser) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Keep the bcrypt compare for govt users (password hashing is required for govt login)
      const valid = await bcrypt.compare(password, govtUser.password);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: govtUser._id, role: 'government' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ success: true, token, role: 'government' });
    } else {
      // No bcrypt compare for regular users, directly compare plain text passwords
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Directly compare the plain text password
      if (password !== user.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ success: true, token, role: 'user', email: user.email });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});



// Signup route
// Example POST handler for saving user info
app.post('/signup', async (req, res) => {
  const { username, email, password, privateKey } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password, // In a real-world app, hash the password before saving
      privateKey, // Store only private key here
    });

    await newUser.save();
    res.status(200).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
