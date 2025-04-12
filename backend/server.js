const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Mongoose model
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  accountAddress: String,
});
const User = mongoose.model('User', UserSchema);

// Signup route
app.post('/signup', async (req, res) => {
  const { username, email, password, accountAddress } = req.body;
  if (!username || !email || !password || !accountAddress) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const newUser = new User({ username, email, password, accountAddress });
    await newUser.save();

    res.status(200).json({ success: true, message: 'User registered' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
