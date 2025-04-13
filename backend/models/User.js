const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Web3 } = require('web3'); // Don't forget to import Web3

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  privateKey: {  // DEMO ONLY
    type: String,
    required: [true, 'Private key is required for demo'],
    select: false,
    validate: {
      validator: (v) => /^0x[a-fA-F0-9]{64}$/.test(v),
      message: 'Invalid private key format (64 hex chars after 0x)'
    }
  },
  publicAddress: {  // Automatically derived
    type: String,
    required: true,
    validate: {
      validator: (v) => /^0x[a-fA-F0-9]{40}$/.test(v),
      message: 'Invalid Ethereum address'
    }
  }
}, { timestamps: true }); // Added timestamps instead of separate createdAt

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    
    // Only generate publicAddress if privateKey is modified
    if (this.isModified('privateKey')) {
      const web3 = new Web3();
      const account = web3.eth.accounts.privateKeyToAccount(this.privateKey);
      this.publicAddress = account.address;
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);