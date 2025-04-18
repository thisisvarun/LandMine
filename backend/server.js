require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const User = require('./models/User'); // Assuming you've moved User model to separate file
const Government = require('./models/Government');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const authRoutes = require('./routes/auth');

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));
app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || 'Internal Server Error' 
  });
});

//Routes
app.use('/api/auth', authRoutes);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/login', limiter);
app.use('/signup', limiter);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Authentication Middleware
const authenticate = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Role-based access control
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Attach user to request
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};

// Routes
app.post('/login', async (req, res) => {
  const { identifier, password, isGovernment } = req.body; // Consistent naming

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    let user, role;
    
    if (isGovernment) {
      user = await Government.findOne({ 
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      });
      role = 'government';
    } else {
      user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier }
        ]
      }).select('+password'); // Important: include hashed password
      role = 'user';
    }

    // Universal password check
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true, 
      token,
      role,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        publicAddress: user.publicAddress,
        ...(role === 'government' && { address: user.address })
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/signup', async (req, res) => {
  const { username, email, password, privateKey } = req.body;

  try {
    // Basic validation
    if (!username || !email || !password || !privateKey) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const newUser = new User({
      username,
      email,
      password, // NOTE: In production, hash this password!
      privateKey // WARNING: Storing private keys in DB is unsafe!
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// Protected example route
app.get('/government/data', authenticate(['government']), (req, res) => {
  res.json({ success: true, data: 'Sensitive government data' });
});

// Initialize server
(async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});